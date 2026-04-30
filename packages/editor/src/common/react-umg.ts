import * as puerts from 'puerts';
import * as React from 'react';
import * as Reconciler from 'react-reconciler';
import { ComboBoxStringProps, TArray } from 'react-umg';
import * as UE from 'ue';

import { error, log } from 'console';

let world: UE.World = undefined;
let reactUMGStarter: UE.ReactUMGStarter = undefined;
let isDebug = false;

function log1(...data: string[]): void {
	if (isDebug) {
		log(data.join(','));
	}
}

function propsToString(props: unknown): string {
	return JSON.stringify(props, ['id', 'key', 'Text', 'DefaultOptions', 'SelectedOption']);
}

declare const exports: { lazyloadComponents: Record<string, string> };

class UEWidget {
	public type: string;

	public callbackRemovers: Record<string, () => void>;

	public nativePtr: UE.Widget;

	private slot: unknown;

	private nativeSlotPtr: UE.PanelSlot;

	private _childs?: UEWidget[];

	private props: Record<string, unknown>;

	public constructor(type: string, props: Record<string, unknown>) {
		this.type = type;
		this.callbackRemovers = {};
		this.init(type, props);
	}

	public toString(): string {
		return `[${this.type}]:${this.childs.length} ${propsToString(this.props)}`;
	}

	private get childs(): UEWidget[] {
		if (!this._childs) {
			this._childs = [];
		}
		return this._childs;
	}

	private init(type: string, props: Record<string, unknown>): void {
		const classPath = exports.lazyloadComponents[type];
		if (classPath) {
			this.nativePtr = UE.NewObject(UE.Class.Load(classPath)) as UE.Widget;
		} else {
			const classObj = (UE as Record<string, unknown>)[type];
			this.nativePtr = new (classObj as new () => UE.Widget)();
		}

		const myProps = {} as Record<string, unknown>;
		for (const key in props) {
			const val = props[key];
			if (key === 'Slot') {
				this.slot = val;
			} else if (typeof val === 'function') {
				this.bind(key, val as (...args: unknown[]) => unknown);
			} else if (key !== 'children') {
				myProps[key] = val;
			}
		}

		this.props = myProps;
		puerts.merge(this.nativePtr, myProps);

		this.synchronizeWidgetProperties(this.nativePtr, type, props);
	}

	private isComboBoxStringOptionEqual(cbs: UE.ComboBoxString, options: TArray<string>): boolean {
		if (cbs.GetOptionCount() !== options.Num()) {
			return false;
		}

		for (let i = 0; i < options.Num(); i++) {
			if (cbs.GetOptionAtIndex(i) !== options.Get(i)) {
				return false;
			}
		}

		return true;
	}

	private reinitComboBoxOptions(cbs: UE.ComboBoxString): void {
		const options: string[] = [];
		for (let i = 0; i < cbs.GetOptionCount(); i++) {
			options.push(cbs.GetOptionAtIndex(i));
		}
		cbs.ClearOptions();
		options.forEach((e) => {
			cbs.AddOption(e);
		});
	}

	private synchronizeWidgetProperties(widget: UE.Widget, type: string, props: unknown): void {
		if (type === 'ComboBoxString') {
			const cbs = widget as UE.ComboBoxString;
			const cbsProps = props as ComboBoxStringProps;

			const options = cbsProps.DefaultOptions;
			const selectedOp = cbsProps.SelectedOption;
			if (options) {
				const prev = cbs.GetSelectedOption();

				// 只有选项改变的时候,才去更新列表,不然会引起回调相关的错误
				if (!this.isComboBoxStringOptionEqual(cbs, options)) {
					cbs.ClearOptions();
					for (let i = 0; i < options.Num(); i++) {
						cbs.AddOption(options.Get(i));
					}

					if (prev && !selectedOp) {
						const index = cbs.FindOptionIndex(prev);
						cbs.SetSelectedIndex(index >= 0 ? index : 0);
					}
				}
			}

			if (selectedOp) {
				if (cbs.GetSelectedOption() !== selectedOp) {
					// 如果选项改变,调用SetSelectedOption可能不会马上生效
					// 需要重新生成整个列表才正常,此为UE的bug
					this.reinitComboBoxOptions(cbs);

					// const index = cbs.FindOptionIndex(selectedOp);
					cbs.SetSelectedOption(selectedOp);
				}
			}
		}
	}

	private bind<T extends (...args: unknown[]) => unknown>(name: string, callback: T): void {
		const { nativePtr } = this;
		const nativeObj = nativePtr as unknown as Record<string, unknown>;
		const muticastProp = nativeObj[name] as UE.$MulticastDelegate<T>;
		if (typeof muticastProp.Add === 'function') {
			muticastProp.Add(callback);
			this.callbackRemovers[name] = (): void => {
				muticastProp.Remove(callback);
			};
			return;
		}

		const unicastProp = nativeObj[name] as UE.$Delegate<T>;
		if (typeof unicastProp.Bind === 'function') {
			unicastProp.Bind(callback);
			this.callbackRemovers[name] = (): void => {
				unicastProp.Unbind();
			};
			return;
		}

		error(`unsupport callback ${name}`);
	}

	public updateProps(oldProps: Record<string, unknown>, newProps: Record<string, unknown>): void {
		const myProps = {} as Record<string, unknown>;
		let propChange = false;
		for (const key in newProps) {
			const oldProp = oldProps[key];
			const newProp = newProps[key];
			if (key !== 'children' && oldProp !== newProp) {
				if (key === 'Slot') {
					this.slot = newProp;
					puerts.merge(this.nativeSlotPtr, newProp);
					UE.UMGManager.SynchronizeSlotProperties(this.nativeSlotPtr);
				} else if (typeof newProp === 'function') {
					this.unbind(key);
					this.bind(key, newProp as (...args: unknown[]) => unknown);
				} else {
					myProps[key] = newProp;
					propChange = true;
				}
			}
		}
		if (propChange) {
			puerts.merge(this.nativePtr, myProps);
			this.synchronizeWidgetProperties(this.nativePtr, this.type, myProps);
			UE.UMGManager.SynchronizeWidgetProperties(this.nativePtr);
		}
	}

	private unbind(name: string): void {
		const remover = this.callbackRemovers[name];
		this.callbackRemovers[name] = undefined;
		if (remover) {
			remover();
		}
	}

	public unbindAll(): void {
		for (const key in this.callbackRemovers) {
			this.callbackRemovers[key]();
		}
		this.callbackRemovers = {};
	}

	public appendChild(child: UEWidget): void {
		if (this.childs.includes(child)) {
			error(
				`${this.toString()} append ${child.toString()} failed: UMG do not support appending child already exist`,
			);
			return;
		}

		log1(`${this.toString()} append ${child.toString()}`);
		const widget = this.nativePtr as UE.PanelWidget;
		const nativeSlot = widget.AddChild(child.nativePtr);
		child.setNativeSlot(nativeSlot);
		this.childs.push(child);
	}

	public insertBefore(child: UEWidget, beforeChild: UEWidget): void {
		const ueParent = this.nativePtr as UE.PanelWidget;
		const ueChild = child.nativePtr;
		const id = this.childs.indexOf(beforeChild);
		log1(
			`${this.toString()} insertBefore: at->${id} child->${child.toString()} before->${beforeChild.toString()} `,
		);
		const nativeSlot = UE.UMGManager.InsertWidget(ueParent, id, ueChild);
		child.setNativeSlot(nativeSlot);
		this.childs.splice(id, 0, child);
	}

	public removeChild(child: UEWidget): void {
		log1(`${this.toString()} remove ${child.toString()}`);
		child.unbindAll();
		(this.nativePtr as UE.PanelWidget).RemoveChild(child.nativePtr);
		this.childs.splice(this.childs.indexOf(child), 1);
	}

	public setNativeSlot(value: UE.PanelSlot): void {
		this.nativeSlotPtr = value;
		if (this.slot) {
			puerts.merge(this.nativeSlotPtr, this.slot);
			UE.UMGManager.SynchronizeSlotProperties(this.nativeSlotPtr);
		}
	}
}

class UEWidgetRoot {
	public readonly nativePtr: UE.ReactWidget;

	private added: boolean;

	public constructor(nativePtr: UE.ReactWidget) {
		this.nativePtr = nativePtr;
	}

	public appendChild(child: UEWidget): void {
		log1(`[Root] appendChild: ${child.toString()}`);
		const nativeSlot = this.nativePtr.AddChild(child.nativePtr);
		child.setNativeSlot(nativeSlot);
	}

	public removeChild(child: UEWidget): void {
		log1(`[Root] removeChild: ${child.toString()}`);
		child.unbindAll();
		this.nativePtr.RemoveChild(child.nativePtr);
	}

	public addToViewport(z: number): void {
		if (!this.added) {
			this.nativePtr.AddToViewport(z);
			this.added = true;
		}
	}

	public removeFromViewport(): void {
		this.nativePtr.RemoveFromViewport();
	}
}

function compareWidgetProps<T>(x: T, y: T): boolean {
	if (x === y) {
		return true;
	}

	if (typeof x !== 'object' || x === undefined || typeof y !== 'object' || y === undefined) {
		return false;
	}

	for (const p in x) {
		if (p === 'children') {
			continue;
		}

		if (!compareWidgetProps(x[p], y[p])) {
			return false;
		}
	}

	for (const p in y) {
		if (p === 'children') {
			continue;
		}

		if (x[p] === undefined) {
			return false;
		}
	}

	return true;
}

const hostConfig: Reconciler.HostConfig<
	string,
	unknown,
	UEWidgetRoot,
	UEWidget,
	UEWidget,
	unknown,
	unknown,
	unknown,
	unknown,
	unknown,
	unknown,
	unknown
> = {
	// useSyncScheduling: true,
	supportsMutation: true,
	isPrimaryRenderer: true,
	supportsPersistence: false,
	supportsHydration: false,

	shouldDeprioritizeSubtree: undefined,
	setTimeout: undefined,
	clearTimeout: undefined,
	cancelDeferredCallback: undefined,
	noTimeout: undefined,
	scheduleDeferredCallback: undefined,

	getRootHostContext() {
		return {};
	},

	// CanvasPanel()的parentHostContext是getRootHostContext返回的值
	getChildHostContext(parentHostContext: unknown) {
		return parentHostContext; // no use, share one
	},

	appendInitialChild(parent: UEWidget, child: UEWidget) {
		parent.appendChild(child);
	},

	appendChildToContainer(container: UEWidgetRoot, child: UEWidget) {
		container.appendChild(child);
	},

	appendChild(parent: UEWidget, child: UEWidget) {
		parent.appendChild(child);
	},

	insertBefore(parent: UEWidget, child: UEWidget, beforeChild: UEWidget) {
		parent.insertBefore(child, beforeChild);
	},

	createInstance(type: string, props: Record<string, unknown>) {
		return new UEWidget(type, props);
	},

	createTextInstance(text: string) {
		return new UEWidget('TextBlock', { Text: text });
	},

	finalizeInitialChildren() {
		return false;
	},

	getPublicInstance(instance: UEWidget) {
		return instance;
	},

	now: Date.now,

	prepareForCommit() {
		// log('prepareForCommit');
	},

	resetAfterCommit(container: UEWidgetRoot) {
		container.addToViewport(0);
	},

	resetTextContent() {
		error('resetTextContent not implemented!');
	},

	shouldSetTextContent(_type, _props) {
		return false;
	},

	commitTextUpdate(textInstance: UEWidget, oldText: string, newText: string) {
		if (oldText !== newText) {
			textInstance.updateProps({}, { Text: newText });
		}
	},

	// return false表示不更新,真值将会出现到commitUpdate的updatePayload里头
	prepareUpdate(_instance: UEWidget, _type: string, oldProps: unknown, newProps: unknown) {
		return !compareWidgetProps(oldProps, newProps);
	},

	commitUpdate(
		instance: UEWidget,
		_updatePayload: unknown,
		_type: string,
		oldProps: Record<string, unknown>,
		newProps: Record<string, unknown>,
	) {
		instance.updateProps(oldProps, newProps);
	},

	removeChildFromContainer(container: UEWidgetRoot, child: UEWidget) {
		container.removeChild(child);
	},

	removeChild(parent: UEWidget, child: UEWidget) {
		parent.removeChild(child);
	},
};

const reconciler = Reconciler(hostConfig);
let umgRoot: UE.UMGRoot = undefined;

export const ReactUMG = {
	render(reactElement: React.ReactNode): void {
		if (!reactUMGStarter) {
			throw new Error('init with ReactUMGStarter first!');
		}

		const root = new UEWidgetRoot(umgRoot as unknown as UE.ReactWidget);
		const container = reconciler.createContainer(root, false, false);
		reconciler.updateContainer(reactElement, container, undefined, undefined);
		reactUMGStarter.SetContent(root.nativePtr);
	},

	init(starter: UE.ReactUMGStarter): void {
		world = starter.GetWorld();
		umgRoot = UE.UMGRoot.CreateUmgRoot(world);
		umgRoot.bIsFocusable = true;
		reactUMGStarter = starter;
	},

	getRoot(): UE.UMGRoot {
		return umgRoot;
	},
};

export function toggleUMGDebug(): void {
	isDebug = !isDebug;
}
