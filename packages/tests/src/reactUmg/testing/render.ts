import * as React from 'react';
import { createRendererForTest, MockWidgetRoot } from '../mockWidgetRoot';
import { createQueries, type QueryUtils } from './widgetTree';

export interface RenderResult extends QueryUtils {
	rerender(element: React.ReactNode): void;
	unmount(): void;
	act(fn: () => void): void;
}

export function render(element: React.ReactNode): RenderResult {
	const root = new MockWidgetRoot();
	const renderer = createRendererForTest(root);
	renderer.render(element);

	const queries = createQueries(root);
	return {
		...queries,
		rerender(next: React.ReactNode): void {
			renderer.render(next);
		},
		unmount(): void {
			renderer.unmount();
		},
		act(fn: () => void): void {
			renderer.flushSync(fn);
		},
	};
}
