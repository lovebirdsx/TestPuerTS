/* eslint-disable @typescript-eslint/no-require-imports */
// PuerTS 不支持 ESM 动态 import，必须用 require 加载 lowlight CJS 入口与按需语言包。
import type { CodeLine, CodeToken, HighlightResult } from './types';

interface HastTextNode {
	type: 'text';
	value: string;
}

interface HastElement {
	type: 'element';
	tagName: string;
	properties?: { className?: string[] };
	children: HastNode[];
}

type HastNode = HastTextNode | HastElement;

interface LowlightCore {
	registerLanguage: (name: string, syntax: unknown) => void;
	highlight: (name: string, value: string) => { value: HastNode[]; relevance: number; language: string };
	registered?: (name: string) => boolean;
}

let coreLoaded = false;
let core: LowlightCore | null = null;
const registeredLangs = new Set<string>();

function loadCore(): LowlightCore | null {
	if (coreLoaded) {
		return core;
	}
	coreLoaded = true;
	try {
		core = require('lowlight/lib/core') as LowlightCore;
	} catch {
		core = null;
	}
	return core;
}

const LANG_LOADERS: Record<string, () => unknown> = {
	typescript: () => require('highlight.js/lib/languages/typescript'),
	javascript: () => require('highlight.js/lib/languages/javascript'),
	json: () => require('highlight.js/lib/languages/json'),
	bash: () => require('highlight.js/lib/languages/bash'),
	python: () => require('highlight.js/lib/languages/python'),
	cpp: () => require('highlight.js/lib/languages/cpp'),
	ini: () => require('highlight.js/lib/languages/ini'),
	markdown: () => require('highlight.js/lib/languages/markdown'),
	diff: () => require('highlight.js/lib/languages/diff'),
};

function ensureLanguage(c: LowlightCore, lang: string): boolean {
	if (registeredLangs.has(lang)) {
		return true;
	}
	const loader = LANG_LOADERS[lang];
	if (!loader) {
		return false;
	}
	try {
		c.registerLanguage(lang, loader());
		registeredLangs.add(lang);
		return true;
	} catch {
		return false;
	}
}

function pushText(line: CodeToken[], text: string, className: string | undefined): void {
	if (text.length === 0) {
		return;
	}
	const last = line[line.length - 1];
	if (last && last.className === className) {
		last.text += text;
		return;
	}
	line.push(className ? { text, className } : { text });
}

interface FlattenState {
	lines: CodeLine[];
	current: CodeToken[];
	classStack: (string | undefined)[];
}

function flattenNode(node: HastNode, state: FlattenState): void {
	if (node.type === 'text') {
		const cls = state.classStack[state.classStack.length - 1];
		const parts = node.value.split('\n');
		for (let i = 0; i < parts.length; i++) {
			pushText(state.current, parts[i]!, cls);
			if (i < parts.length - 1) {
				state.lines.push(state.current);
				state.current = [];
			}
		}
		return;
	}
	if (node.type === 'element' && node.tagName === 'span') {
		const className = node.properties?.className?.[0];
		// 嵌套 span 时按"最近 className 优先"的语义入栈；缺 className 复用当前栈顶
		state.classStack.push(className ?? state.classStack[state.classStack.length - 1]);
		for (const child of node.children) {
			flattenNode(child, state);
		}
		state.classStack.pop();
	}
}

/**
 * 用 lowlight 给一段代码做语法着色，返回与 fallback 同型的 HighlightResult。
 * 任何加载/注册/着色失败都返回 null，上层即落到 fallback 通道。
 */
export function lowlightHighlight(language: string, code: string): HighlightResult | null {
	const c = loadCore();
	if (!c) {
		return null;
	}
	if (!ensureLanguage(c, language)) {
		return null;
	}
	let tree: { value: HastNode[]; language: string };
	try {
		tree = c.highlight(language, code);
	} catch {
		return null;
	}
	const state: FlattenState = { lines: [], current: [], classStack: [] };
	for (const node of tree.value) {
		flattenNode(node, state);
	}
	state.lines.push(state.current);
	return { language: tree.language || language, lines: state.lines, fallback: false };
}
