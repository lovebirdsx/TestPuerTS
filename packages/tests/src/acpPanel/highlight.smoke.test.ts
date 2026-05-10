/* eslint-disable @typescript-eslint/no-require-imports */
// PuerTS 不支持 ESM 动态 import，必须用 require 加载 lowlight CJS 入口与 highlight.js 语言包。
import { describe, expect, it } from '../testRunner';

describe('AcpPanel highlight / smoke', () => {
	it('lowlight CJS core can highlight typescript and emit hast tree', () => {
		const lowlight = require('lowlight/lib/core') as {
			registerLanguage: (name: string, syntax: unknown) => void;
			highlight: (name: string, value: string) => { value: unknown[]; relevance: number; language: string };
		};
		const ts = require('highlight.js/lib/languages/typescript');
		lowlight.registerLanguage('typescript', ts);

		const tree = lowlight.highlight('typescript', 'const x: number = 1;');

		expect(Array.isArray(tree.value)).toBe(true);
		expect(tree.value.length > 0).toBe(true);

		const flat = JSON.stringify(tree.value);
		expect(flat.includes('hljs-keyword')).toBe(true);
		expect(flat.includes('hljs-number')).toBe(true);
	});

	it('diff diffLines emits added/removed segments', () => {
		const Diff = require('diff') as {
			diffLines: (a: string, b: string) => { value: string; added?: boolean; removed?: boolean }[];
		};
		const parts = Diff.diffLines('a\nb\nc\n', 'a\nB\nc\n');

		expect(parts.length >= 3).toBe(true);
		expect(parts.some((p) => p.added === true)).toBe(true);
		expect(parts.some((p) => p.removed === true)).toBe(true);
	});
});
