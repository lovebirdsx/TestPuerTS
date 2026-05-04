import * as puerts from 'puerts';
import * as React from 'react';
import * as Reconciler from 'react-reconciler';
import { ComboBoxStringProps, TArray } from 'react-umg';
import * as UE from 'ue';
import { createLogger } from '@universe-agent/editor-common';

const logger = createLogger('editor:umgRenderer');

// 加载蓝图组件路径表（非 Native Widget 需通过资源路径动态加载）
// eslint-disable-next-line @typescript-eslint/no-require-imports
const reactUmgModule = require('react-umg') as { lazyloadComponents: Record<string, string> };

function propsToString(props: unknown): string {
	return JSON.stringify(props, ['id', 'key', 'Text', 'DefaultOptions', 'SelectedOption']);
}

export interface IWidgetRoot {
	appendChild(child: UEWidget): void;
	removeChild(child: UEWidget): void;
}

export class UEWidget {
	public type: string;

	public callbackRemovers: Record<string, () => void>;

	public nativePtr: UE.Widget;

	private slot: unknown;

	private nativeSlotPtr: UE.PanelSlot;

	private _childs: UEWidget[] = [];

	private _props: Record<string, unknown> = {};

	public constructor(type: string, props: Record<string, unknown>) {
		this.type = type;
		this.callbackRemovers = {};
		this.init(type, props);
	}

	public toString(): string {
		return `[${this.type}]:${this._childs.length} ${propsToString(this._props)}`;
	}

	private get childs(): UEWidget[] {
		return this._childs;
	}

	// 测试用：只读访问 JS 侧维护的子节点列表（与 nativePtr 容器子节点同步）
	public get children(): readonly UEWidget[] {
		return this._childs;
	}

	// 测试用：只读访问当前 props 快照（不包含 children/Slot/事件回调）
	public get props(): Readonly<Record<string, unknown>> {
		return this._props;
	}

	private init(type: string, props: Record<string, unknown>): void {
		const classPath = reactUmgModule.lazyloadComponents[type];
		if (classPath) {
			// 蓝图 Widget：必须通过 UE.Class.Load 动态加载资源
			this.nativePtr = UE.NewObject(UE.Class.Load(classPath)) as UE.Widget;
		} else {
			// Native Widget：直接实例化
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

		this._props = myProps;
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

		logger.error(`unsupport callback ${name}`);
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
		// 同步快照供测试查询读取（包含本次变更的非 Slot / 非函数 props）
		Object.assign(this._props, myProps);
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
			logger.error(
				`${this.toString()} append ${child.toString()} failed: UMG do not support appending child already exist`,
			);
			return;
		}

		const widget = this.nativePtr as UE.PanelWidget;
		const nativeSlot = widget.AddChild(child.nativePtr);
		child.setNativeSlot(nativeSlot);
		this.childs.push(child);
	}

	public insertBefore(child: UEWidget, beforeChild: UEWidget): void {
		const ueParent = this.nativePtr as UE.PanelWidget;
		const ueChild = child.nativePtr;
		const id = this.childs.indexOf(beforeChild);
		const nativeSlot = UE.UMGManager.InsertWidget(ueParent, id, ueChild);
		child.setNativeSlot(nativeSlot);
		this.childs.splice(id, 0, child);
	}

	public removeChild(child: UEWidget): void {
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

export class UEWidgetRoot implements IWidgetRoot {
	public readonly nativePtr: UE.UMGRoot;

	public constructor(nativePtr: UE.UMGRoot) {
		this.nativePtr = nativePtr;
	}

	public appendChild(child: UEWidget): void {
		const nativeSlot = this.nativePtr.AddChild(child.nativePtr);
		child.setNativeSlot(nativeSlot);
	}

	public removeChild(child: UEWidget): void {
		child.unbindAll();
		this.nativePtr.RemoveChild(child.nativePtr);
	}
}

export function compareWidgetProps<T>(x: T, y: T): boolean {
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

export function createHostConfig(): any {
	// 优先级状态必须有实际存储，reconciler commit 阶段会读写它
	let currentUpdatePriority = 0;

	return {
		supportsMutation: true,
		isPrimaryRenderer: true,
		supportsPersistence: false,
		supportsHydration: false,

		// react-reconciler 0.31 要求的调度接口
		scheduleTimeout: setTimeout,
		cancelTimeout: clearTimeout,
		noTimeout: -1,

		// 优先级接口：resolveUpdatePriority 返回 SyncLane(2) 确保同步路径
		setCurrentUpdatePriority(priority: number) {
			currentUpdatePriority = priority;
		},
		getCurrentUpdatePriority() {
			return currentUpdatePriority;
		},
		resolveUpdatePriority() {
			return currentUpdatePriority !== 0 ? currentUpdatePriority : 2; // SyncLane = 2
		},
		shouldAttemptEagerTransition() {
			return false;
		},

		detachDeletedInstance(_instance: UEWidget) {},

		// react-reconciler 0.31 需要提供以下字段，否则 render/commit 阶段会抛 TypeError
		getInstanceFromNode(_node: unknown) {
			return null;
		},
		beforeActiveInstanceBlur() {},
		afterActiveInstanceBlur() {},
		prepareScopeUpdate(_scopeInstance: unknown, _inst: unknown) {},
		getInstanceFromScope(_scopeInstance: unknown) {
			return null;
		},
		// maySuspendCommit 在 render 阶段被直接调用，必须返回 boolean
		maySuspendCommit(_type: string, _props: unknown) {
			return false;
		},
		preloadInstance(_type: string, _props: unknown) {
			return true;
		},
		startSuspendingCommit() {},
		suspendInstance(_type: string, _props: unknown) {},
		waitForCommitToBeReady() {
			return null;
		},
		preparePortalMount(_containerInfo: unknown) {},
		// PuerTS 环境无 queueMicrotask，禁用微任务调度
		supportsMicrotasks: false,

		getRootHostContext() {
			return {};
		},

		getChildHostContext(parentHostContext: unknown) {
			return parentHostContext;
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

		insertInContainerBefore(container: UEWidgetRoot, child: UEWidget, _beforeChild: UEWidget) {
			// UMGRoot 只有单根节点，不支持 insertBefore，此处降级为 appendChild
			container.appendChild(child);
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

		// prepareForCommit 必须返回 null 或 Instance
		prepareForCommit(_containerInfo: UEWidgetRoot) {
			return null;
		},

		resetAfterCommit(_container: UEWidgetRoot) {},

		resetTextContent() {
			logger.error('resetTextContent not implemented!');
		},

		shouldSetTextContent(_type, _props) {
			return false;
		},

		commitTextUpdate(textInstance: UEWidget, oldText: string, newText: string) {
			if (oldText !== newText) {
				textInstance.updateProps({}, { Text: newText });
			}
		},

		// react-reconciler 0.31 实际调用：commitUpdate(stateNode, type, oldProps, newProps, finishedWork)
		// 注意：0.31 之前的签名是 (instance, updatePayload, type, oldProps, newProps)，此版本已变更
		prepareUpdate(_instance: UEWidget, _type: string, oldProps: unknown, newProps: unknown) {
			return !compareWidgetProps(oldProps, newProps);
		},

		commitUpdate(
			instance: UEWidget,
			_type: string,
			oldProps: Record<string, unknown>,
			newProps: Record<string, unknown>,
			_finishedWork: unknown,
		) {
			instance.updateProps(oldProps, newProps);
		},

		removeChildFromContainer(container: UEWidgetRoot, child: UEWidget) {
			container.removeChild(child);
		},

		removeChild(parent: UEWidget, child: UEWidget) {
			parent.removeChild(child);
		},

		clearContainer(_container: UEWidgetRoot) {},
	};
}

export function createRendererForTest(root: IWidgetRoot): {
	render(element: React.ReactNode): void;
	unmount(): void;
	flushSync(fn: () => void): void;
} {
	const reconciler = Reconciler(createHostConfig());
	const container = (reconciler.createContainer as (...args: unknown[]) => unknown)(
		root,
		0,
		null,
		false,
		false,
		'',
		(err: unknown) => {
			logger.error('ReactUMG uncaught error:', err);
		},
		(err: unknown) => {
			logger.error('ReactUMG caught error:', err);
		},
		(err: unknown) => {
			logger.error('ReactUMG recoverable error:', err);
		},
		null,
	);
	const reconcilerInternal = reconciler as unknown as Record<string, (...args: unknown[]) => unknown>;

	return {
		render(element: React.ReactNode): void {
			reconcilerInternal.flushSyncFromReconciler(() => {
				reconciler.updateContainer(element, container, null, null);
			});
		},
		unmount(): void {
			reconcilerInternal.flushSyncFromReconciler(() => {
				reconciler.updateContainer(null, container, null, null);
			});
		},
		flushSync(fn: () => void): void {
			reconcilerInternal.flushSyncFromReconciler(fn);
		},
	};
}

export class ReactUMGInstance {
	private starter: UE.ReactUMGStarter;
	private umgRoot: UE.UMGRoot;
	private reconciler: ReturnType<typeof Reconciler>;

	public init(starter: UE.ReactUMGStarter): void {
		this.starter = starter;
		this.umgRoot = UE.UMGRoot.CreateUmgRoot(starter.GetWorld());
		this.umgRoot.bIsFocusable = true;
		this.reconciler = Reconciler(createHostConfig());
	}

	public render(reactElement: React.ReactNode): void {
		if (!this.starter) {
			throw new Error('init with ReactUMGStarter first!');
		}

		const root = new UEWidgetRoot(this.umgRoot);

		// react-reconciler 0.31 createContainer 签名：
		// (containerInfo, tag, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride,
		//  identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, transitionCallbacks)
		const container = (this.reconciler.createContainer as (...args: unknown[]) => unknown)(
			root,
			0, // LegacyRoot
			null,
			false,
			false,
			'',
			// onUncaughtError / onCaughtError 不能 throw：
			// commit 阶段出错后 reconciler 会调这些回调再重新调度，若再 throw 会无限循环
			(err: unknown) => {
				logger.error('ReactUMG uncaught error:', err);
			},
			(err: unknown) => {
				logger.error('ReactUMG caught error:', err);
			},
			(err: unknown) => {
				logger.error('ReactUMG recoverable error:', err);
			},
			null,
		);

		// 用 flushSyncFromReconciler 包裹 updateContainer 强制同步提交：
		// updateContainer 在 0.31 中依赖 Scheduler 的 MessageChannel 异步驱动，
		// PuerTS 环境 JS 调用未返回时消息循环不会运转，渲染永远不会执行。
		// flushSyncFromReconciler 在 finally 里立即调用 flushSyncWorkAcrossRoots_impl，
		// 确保 widget 树在此函数返回前完成提交。
		const reconcilerInternal = this.reconciler as unknown as Record<string, (...args: unknown[]) => unknown>;
		reconcilerInternal.flushSyncFromReconciler(() => {
			this.reconciler.updateContainer(reactElement, container, null, null);
		});

		this.starter.SetContent(root.nativePtr);
	}

	public getRoot(): UE.UMGRoot {
		return this.umgRoot;
	}
}
