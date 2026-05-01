import * as React from 'react';
import * as UE from 'ue';
import { describe, it, expect } from '../testRunner';
import { createRendererForTest, MockWidgetRoot } from './mockWidgetRoot';

// Helper: render a React element to a fresh MockWidgetRoot and return it
function renderToRoot(element: React.ReactNode): MockWidgetRoot {
	const root = new MockWidgetRoot();
	const renderer = createRendererForTest(root);
	renderer.render(element);
	return root;
}

describe('ReactUMG Reconciler - initial render', () => {
	it('renders a single TextBlock to the root', () => {
		const root = renderToRoot(React.createElement('TextBlock', { Text: 'hello' }));
		expect(root.children.length).toBe(1);
		expect(root.children[0].type).toBe('TextBlock');
		expect((root.children[0].nativePtr as UE.TextBlock).Text).toBe('hello');
	});

	it('renders text content as a TextBlock inside VerticalBox', () => {
		const root = renderToRoot(React.createElement('VerticalBox', null, 'plain text'));
		const vbox = root.children[0];
		expect(vbox.type).toBe('VerticalBox');
		const panel = vbox.nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(1);
	});

	it('renders nested VerticalBox with Button and TextBlock children', () => {
		const root = renderToRoot(
			React.createElement(
				'VerticalBox',
				null,
				React.createElement('Button', null),
				React.createElement('TextBlock', { Text: 'label' }),
			),
		);
		expect(root.children.length).toBe(1);
		const vbox = root.children[0];
		expect(vbox.type).toBe('VerticalBox');
		const panel = vbox.nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(2);
	});

	it('renders a Button correctly', () => {
		const root = renderToRoot(React.createElement('Button', null));
		expect(root.children[0].type).toBe('Button');
		expect(root.children[0].nativePtr instanceof UE.Button).toBe(true);
	});
});

describe('ReactUMG Reconciler - updates', () => {
	// State updates dispatched outside render need flushSync to commit synchronously,
	// because the PuerTS environment has no MessageChannel to drive async scheduling.
	it('updates a Text prop when state changes', () => {
		let setLabel: (v: string) => void;

		const Component = (): React.ReactElement => {
			const [label, setLabelState] = React.useState('initial');
			setLabel = setLabelState;
			return React.createElement('TextBlock', { Text: label });
		};

		const root = new MockWidgetRoot();
		const renderer = createRendererForTest(root);
		renderer.render(React.createElement(Component, null));

		expect((root.children[0].nativePtr as UE.TextBlock).Text).toBe('initial');

		renderer.flushSync(() => {
			setLabel!('updated');
		});
		expect((root.children[0].nativePtr as UE.TextBlock).Text).toBe('updated');
	});

	it('adds a child when conditional render becomes true', () => {
		let setVisible: (v: boolean) => void;

		const Component = (): React.ReactElement => {
			const [visible, setVisibleState] = React.useState(false);
			setVisible = setVisibleState;
			return React.createElement('VerticalBox', null, visible ? React.createElement('Button', null) : null);
		};

		const root = new MockWidgetRoot();
		const renderer = createRendererForTest(root);
		renderer.render(React.createElement(Component, null));

		const panel = root.children[0].nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(0);

		renderer.flushSync(() => {
			setVisible!(true);
		});
		expect(panel.GetChildrenCount()).toBe(1);
	});

	it('removes a child when conditional render becomes false', () => {
		let setVisible: (v: boolean) => void;

		const Component = (): React.ReactElement => {
			const [visible, setVisibleState] = React.useState(true);
			setVisible = setVisibleState;
			return React.createElement('VerticalBox', null, visible ? React.createElement('Button', null) : null);
		};

		const root = new MockWidgetRoot();
		const renderer = createRendererForTest(root);
		renderer.render(React.createElement(Component, null));

		const panel = root.children[0].nativePtr as UE.VerticalBox;
		expect(panel.GetChildrenCount()).toBe(1);

		renderer.flushSync(() => {
			setVisible!(false);
		});
		expect(panel.GetChildrenCount()).toBe(0);
	});
});

describe('ReactUMG Reconciler - unmount', () => {
	it('removes all children from root on unmount', () => {
		const root = new MockWidgetRoot();
		const renderer = createRendererForTest(root);
		renderer.render(React.createElement('TextBlock', { Text: 'bye' }));
		expect(root.children.length).toBe(1);

		renderer.unmount();
		expect(root.children.length).toBe(0);
	});
});

describe('ReactUMG Reconciler - event handling', () => {
	it('OnClicked callback triggers state update and re-render', () => {
		let clickCount = 0;

		const Component = (): React.ReactElement => {
			const [count, setCount] = React.useState(0);
			clickCount = count;
			return React.createElement('Button', {
				OnClicked: (): void => {
					setCount((c) => c + 1);
				},
			});
		};

		const root = new MockWidgetRoot();
		const renderer = createRendererForTest(root);
		renderer.render(React.createElement(Component, null));

		expect(clickCount).toBe(0);
		// OnClicked.Broadcast() calls the handler synchronously;
		// the state update is flushed immediately inside flushSyncFromReconciler
		// because Broadcast triggers the callback which is already inside the reconciler's
		// event batching context during commit.
		renderer.flushSync(() => {
			(root.children[0].nativePtr as UE.Button).OnClicked.Broadcast();
		});
		expect(clickCount).toBe(1);
		renderer.flushSync(() => {
			(root.children[0].nativePtr as UE.Button).OnClicked.Broadcast();
		});
		expect(clickCount).toBe(2);
	});
});
