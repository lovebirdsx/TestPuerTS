import * as UE from 'ue';
import { describe, it, expect, beforeAll } from '../testRunner';
import type { UEWidget as UEWidgetType } from 'editor';
import { UEWidget, MockWidgetRoot } from './mockWidgetRoot';

// UEWidget wraps native UE widgets. UObjects can be created in Commandlet mode
// without a World, but some widget types may fail in a headless environment.
// Tests here use simple container/leaf widgets that work without a UI context.

describe('UEWidget - creation', () => {
	it('creates a TextBlock and exposes its native pointer', () => {
		const w = new UEWidget('TextBlock', {});
		expect(w.nativePtr instanceof UE.TextBlock).toBe(true);
		expect(w.type).toBe('TextBlock');
	});

	it('creates a Button and exposes its native pointer', () => {
		const w = new UEWidget('Button', {});
		expect(w.nativePtr instanceof UE.Button).toBe(true);
	});

	it('creates a VerticalBox and exposes its native pointer', () => {
		const w = new UEWidget('VerticalBox', {});
		expect(w.nativePtr instanceof UE.VerticalBox).toBe(true);
	});
});

describe('UEWidget - updateProps', () => {
	it('updates Text property on a TextBlock', () => {
		const root = new MockWidgetRoot();
		const w = new UEWidget('TextBlock', { Text: 'initial' });
		root.appendChild(w);
		w.updateProps({ Text: 'initial' }, { Text: 'updated' });
		expect((w.nativePtr as UE.TextBlock).Text).toBe('updated');
	});

	it('does not throw when no prop changed', () => {
		const root = new MockWidgetRoot();
		const w = new UEWidget('TextBlock', { Text: 'same' });
		root.appendChild(w);
		w.updateProps({ Text: 'same' }, { Text: 'same' });
		expect(true).toBe(true);
	});

	it('re-binds event callback when function prop changes', () => {
		const root = new MockWidgetRoot();
		let calls = 0;
		const cb1 = (): void => {
			calls++;
		};
		const cb2 = (): void => {
			calls += 10;
		};
		const w = new UEWidget('Button', { OnClicked: cb1 });
		root.appendChild(w);
		w.updateProps({ OnClicked: cb1 }, { OnClicked: cb2 });
		// cb1 should be removed, cb2 should be bound
		(w.nativePtr as UE.Button).OnClicked.Broadcast();
		expect(calls).toBe(10);
	});
});

describe('UEWidget - event binding', () => {
	it('calls OnClicked callback when broadcast', () => {
		const root = new MockWidgetRoot();
		let clicked = 0;
		const w = new UEWidget('Button', {
			OnClicked: (): void => {
				clicked++;
			},
		});
		root.appendChild(w);
		(w.nativePtr as UE.Button).OnClicked.Broadcast();
		expect(clicked).toBe(1);
	});

	it('unbindAll removes all event listeners', () => {
		const root = new MockWidgetRoot();
		let clicked = 0;
		const w = new UEWidget('Button', {
			OnClicked: (): void => {
				clicked++;
			},
		});
		root.appendChild(w);
		w.unbindAll();
		(w.nativePtr as UE.Button).OnClicked.Broadcast();
		expect(clicked).toBe(0);
	});
});

describe('UEWidget - tree operations', () => {
	let parent: UEWidgetType;
	let child1: UEWidgetType;
	let child2: UEWidgetType;

	beforeAll(() => {
		const root = new MockWidgetRoot();
		parent = new UEWidget('VerticalBox', {});
		root.appendChild(parent);
		child1 = new UEWidget('TextBlock', { Text: 'first' });
		child2 = new UEWidget('TextBlock', { Text: 'second' });
	});

	it('appendChild adds a child to the native panel widget', () => {
		parent.appendChild(child1);
		const panel = parent.nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(1);
	});

	it('appendChild adds a second child', () => {
		parent.appendChild(child2);
		const panel = parent.nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(2);
	});

	it('insertBefore inserts at the correct position', () => {
		const child3 = new UEWidget('TextBlock', { Text: 'inserted' });
		parent.insertBefore(child3, child1);
		const panel = parent.nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(3);
		// child3 should now be at index 0
		expect(panel.GetChildAt(0) === child3.nativePtr).toBe(true);
	});

	it('removeChild removes the child from the native panel widget', () => {
		parent.removeChild(child2);
		const panel = parent.nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(2);
	});
});
