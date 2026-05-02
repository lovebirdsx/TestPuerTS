import * as UE from 'ue';
import type { UEWidget } from 'editor';

type AnyDelegate = { Broadcast?: (...args: unknown[]) => void; Execute?: (...args: unknown[]) => void };

function broadcast(widget: UEWidget, eventName: string, ...args: unknown[]): void {
	const native = widget.nativePtr as unknown as Record<string, AnyDelegate | undefined>;
	const delegate = native[eventName];
	if (!delegate) {
		throw new Error(`Widget ${widget.toString()} has no delegate "${eventName}"`);
	}
	if (typeof delegate.Broadcast === 'function') {
		delegate.Broadcast(...args);
		return;
	}
	if (typeof delegate.Execute === 'function') {
		delegate.Execute(...args);
		return;
	}
	throw new Error(`Delegate "${eventName}" on ${widget.toString()} has no Broadcast/Execute`);
}

export const fireEvent = {
	click(widget: UEWidget): void {
		broadcast(widget, 'OnClicked');
	},
	textChanged(widget: UEWidget, text: string): void {
		broadcast(widget, 'OnTextChanged', text);
	},
	textCommitted(widget: UEWidget, text: string, commitMethod: number = 0): void {
		broadcast(widget, 'OnTextCommitted', text, commitMethod);
	},
	selectionChanged(widget: UEWidget, value: string, selectionType: number = 0): void {
		broadcast(widget, 'OnSelectionChanged', value, selectionType);
	},
	checkStateChanged(widget: UEWidget, checked: boolean): void {
		broadcast(widget, 'OnCheckStateChanged', checked);
	},
	custom(widget: UEWidget, eventName: string, ...args: unknown[]): void {
		broadcast(widget, eventName, ...args);
	},
};

// 重新导出 UE 以便测试代码使用
export { UE };
