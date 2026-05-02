import * as UE from 'ue';
import type { UEWidget } from 'editor';
import type { MockWidgetRoot } from '../mockWidgetRoot';

export interface QueryUtils {
	root: MockWidgetRoot;
	findByType(type: string): UEWidget;
	findAllByType(type: string): UEWidget[];
	queryByType(type: string): UEWidget | undefined;
	findByProp(predicate: (props: Readonly<Record<string, unknown>>, widget: UEWidget) => boolean): UEWidget;
	findAllByProp(predicate: (props: Readonly<Record<string, unknown>>, widget: UEWidget) => boolean): UEWidget[];
	findByText(text: string | RegExp): UEWidget;
	findAllByText(text: string | RegExp): UEWidget[];
	queryByText(text: string | RegExp): UEWidget | undefined;
	// 查找 type 类型且后代含有匹配文本的节点。常用于按按钮文案找 Button：
	// findByTypeWithText('Button', 'Connect')
	findByTypeWithText(type: string, text: string | RegExp): UEWidget;
	findAllByTypeWithText(type: string, text: string | RegExp): UEWidget[];
	queryByTypeWithText(type: string, text: string | RegExp): UEWidget | undefined;
	debug(): string;
}

function walk(root: MockWidgetRoot, visit: (widget: UEWidget) => void): void {
	const stack: UEWidget[] = [...root.children];
	while (stack.length > 0) {
		const node = stack.pop()!;
		visit(node);
		const childs = node.children;
		for (let i = childs.length - 1; i >= 0; i--) {
			stack.push(childs[i]!);
		}
	}
}

function getWidgetText(widget: UEWidget): string | undefined {
	const candidate = widget.nativePtr as unknown as { Text?: unknown };
	const value = candidate.Text;
	return typeof value === 'string' ? value : undefined;
}

function textMatches(actual: string | undefined, expected: string | RegExp): boolean {
	if (actual === undefined) return false;
	return expected instanceof RegExp ? expected.test(actual) : actual === expected;
}

function expectOne(matches: UEWidget[], description: string): UEWidget {
	if (matches.length === 0) {
		throw new Error(`No widget found matching ${description}`);
	}
	if (matches.length > 1) {
		throw new Error(
			`Expected exactly 1 widget matching ${description}, found ${matches.length}: ${matches
				.map((m) => m.toString())
				.join(', ')}`,
		);
	}
	return matches[0]!;
}

function formatTree(root: MockWidgetRoot): string {
	const lines: string[] = [];
	function recur(widget: UEWidget, depth: number): void {
		const indent = '  '.repeat(depth);
		const text = getWidgetText(widget);
		const propStr = text !== undefined ? ` Text=${JSON.stringify(text)}` : '';
		lines.push(`${indent}<${widget.type}${propStr} />`);
		for (const child of widget.children) recur(child, depth + 1);
	}
	for (const child of root.children) recur(child, 0);
	return lines.join('\n');
}

export function createQueries(root: MockWidgetRoot): QueryUtils {
	const findAllByType = (type: string): UEWidget[] => {
		const out: UEWidget[] = [];
		walk(root, (w) => {
			if (w.type === type) out.push(w);
		});
		return out;
	};

	const findAllByProp = (
		predicate: (props: Readonly<Record<string, unknown>>, widget: UEWidget) => boolean,
	): UEWidget[] => {
		const out: UEWidget[] = [];
		walk(root, (w) => {
			if (predicate(w.props, w)) out.push(w);
		});
		return out;
	};

	const findAllByText = (text: string | RegExp): UEWidget[] => {
		const out: UEWidget[] = [];
		walk(root, (w) => {
			if (textMatches(getWidgetText(w), text)) out.push(w);
		});
		return out;
	};

	function descendantHasText(widget: UEWidget, text: string | RegExp): boolean {
		if (textMatches(getWidgetText(widget), text)) return true;
		for (const child of widget.children) {
			if (descendantHasText(child, text)) return true;
		}
		return false;
	}

	const findAllByTypeWithText = (type: string, text: string | RegExp): UEWidget[] => {
		const out: UEWidget[] = [];
		walk(root, (w) => {
			if (w.type === type && descendantHasText(w, text)) out.push(w);
		});
		return out;
	};

	return {
		root,
		findByType(type) {
			return expectOne(findAllByType(type), `type=${type}`);
		},
		findAllByType,
		queryByType(type) {
			const matches = findAllByType(type);
			if (matches.length > 1) {
				throw new Error(`queryByType: expected at most 1 widget of type ${type}, found ${matches.length}`);
			}
			return matches[0];
		},
		findByProp(predicate) {
			return expectOne(findAllByProp(predicate), 'prop predicate');
		},
		findAllByProp,
		findByText(text) {
			return expectOne(findAllByText(text), `text=${String(text)}`);
		},
		findAllByText,
		queryByText(text) {
			const matches = findAllByText(text);
			if (matches.length > 1) {
				throw new Error(
					`queryByText: expected at most 1 widget with text ${String(text)}, found ${matches.length}`,
				);
			}
			return matches[0];
		},
		findByTypeWithText(type, text) {
			return expectOne(findAllByTypeWithText(type, text), `type=${type} containing text=${String(text)}`);
		},
		findAllByTypeWithText,
		queryByTypeWithText(type, text) {
			const matches = findAllByTypeWithText(type, text);
			if (matches.length > 1) {
				throw new Error(
					`queryByTypeWithText: expected at most 1 ${type} containing ${String(text)}, found ${matches.length}`,
				);
			}
			return matches[0];
		},
		debug() {
			return formatTree(root);
		},
	};
}

// 重新导出 UE 以便测试代码可以使用
export { UE };
