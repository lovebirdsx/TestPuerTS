import * as React from 'react';
import { describe, it, expect } from '../testRunner';
import { render, fireEvent } from './testing';

describe('reactUmg testing toolkit - queries', () => {
	it('findByType locates a TextBlock', () => {
		const view = render(React.createElement('TextBlock', { Text: 'hello' }));
		const tb = view.findByType('TextBlock');
		expect(tb.type).toBe('TextBlock');
	});

	it('findByText matches plain string', () => {
		const view = render(React.createElement('TextBlock', { Text: 'world' }));
		expect(view.queryByText('world')).toBeTruthy();
		expect(view.queryByText('missing')).toBeUndefined();
	});

	it('findByText matches RegExp', () => {
		const view = render(React.createElement('TextBlock', { Text: 'session-abc' }));
		expect(view.queryByText(/session-/)).toBeTruthy();
	});

	it('findByProp matches predicate', () => {
		const view = render(React.createElement('TextBlock', { Text: 'p' }));
		const w = view.findByProp((p) => p.Text === 'p');
		expect(w.type).toBe('TextBlock');
	});

	it('findAllByType collects multiple instances', () => {
		const view = render(
			React.createElement(
				'VerticalBox',
				null,
				React.createElement('TextBlock', { Text: 'a' }),
				React.createElement('TextBlock', { Text: 'b' }),
			),
		);
		expect(view.findAllByType('TextBlock').length).toBe(2);
	});

	it('findByTypeWithText matches an ancestor type containing nested text', () => {
		const view = render(React.createElement('Button', null, React.createElement('TextBlock', { Text: 'Save' })));
		const btn = view.findByTypeWithText('Button', 'Save');
		expect(btn.type).toBe('Button');
	});
});

describe('reactUmg testing toolkit - events', () => {
	it('fireEvent.click broadcasts OnClicked and triggers state update', () => {
		let count = 0;
		const Comp = (): React.ReactElement => {
			const [n, setN] = React.useState(0);
			count = n;
			return React.createElement('Button', {
				OnClicked: () => setN((v) => v + 1),
			});
		};
		const view = render(React.createElement(Comp));
		expect(count).toBe(0);
		view.act(() => fireEvent.click(view.findByType('Button')));
		expect(count).toBe(1);
	});
});

describe('reactUmg testing toolkit - rerender / unmount', () => {
	it('rerender updates props', () => {
		const view = render(React.createElement('TextBlock', { Text: 'first' }));
		expect(view.queryByText('first')).toBeTruthy();
		view.rerender(React.createElement('TextBlock', { Text: 'second' }));
		expect(view.queryByText('second')).toBeTruthy();
		expect(view.queryByText('first')).toBeUndefined();
	});

	it('unmount empties the root', () => {
		const view = render(React.createElement('TextBlock', { Text: 'bye' }));
		expect(view.root.children.length).toBe(1);
		view.unmount();
		expect(view.root.children.length).toBe(0);
	});
});

describe('reactUmg testing toolkit - debug output', () => {
	it('debug renders a tree representation', () => {
		const view = render(React.createElement('VerticalBox', null, React.createElement('TextBlock', { Text: 'x' })));
		const out = view.debug();
		expect(out).toContain('VerticalBox');
		expect(out).toContain('TextBlock');
		expect(out).toContain('"x"');
	});
});
