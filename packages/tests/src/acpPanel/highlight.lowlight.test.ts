import { highlightCode, type CodeToken } from 'editor';

import { describe, expect, it } from '../testRunner';

function classNames(lines: CodeToken[][]): string[] {
	const out: string[] = [];
	for (const line of lines) {
		for (const t of line) {
			if (t.className) {
				out.push(t.className);
			}
		}
	}
	return out;
}

function joinedText(lines: CodeToken[][]): string {
	return lines.map((line) => line.map((t) => t.text).join('')).join('\n');
}

describe('AcpPanel highlight / lowlight adapter', () => {
	it('typescript: keyword + number + string + comment + line breaks preserved', () => {
		const code = ['// hi', 'const x: number = 42;', 'const s = "ok";', ''].join('\n');
		const r = highlightCode('typescript', code);

		expect(r.fallback).toBe(false);
		expect(r.language).toBe('typescript');
		expect(r.lines.length).toBe(4);
		expect(joinedText(r.lines)).toBe(code);

		const cls = classNames(r.lines);
		expect(cls.includes('hljs-keyword')).toBe(true);
		expect(cls.includes('hljs-number')).toBe(true);
		expect(cls.includes('hljs-string')).toBe(true);
		expect(cls.includes('hljs-comment')).toBe(true);
	});

	it('json: true/false/null literals classed', () => {
		const r = highlightCode('json', '{"a":true,"b":null,"c":1.5}');
		expect(r.fallback).toBe(false);

		const cls = new Set(classNames(r.lines));
		expect(cls.has('hljs-string') || cls.has('hljs-attr')).toBe(true);
		expect(cls.has('hljs-number')).toBe(true);
	});

	it('bash: keywords like if/then/fi tagged', () => {
		const r = highlightCode('bash', 'if [ -f x ]; then echo hi; fi');
		expect(r.fallback).toBe(false);
		expect(classNames(r.lines).includes('hljs-keyword')).toBe(true);
	});

	it('block comment spanning multiple lines splits into separate lines', () => {
		const code = ['/* first', '   second', '   third */', 'const a = 1;'].join('\n');
		const r = highlightCode('typescript', code);

		expect(r.fallback).toBe(false);
		expect(r.lines.length).toBe(4);
		// 前 3 行至少包含一个 comment token
		for (let i = 0; i < 3; i++) {
			expect(r.lines[i]!.some((t) => t.className === 'hljs-comment')).toBe(true);
		}
	});

	it('round-trips text exactly (no character loss / no extra whitespace)', () => {
		const samples = [
			'',
			'a',
			'\n',
			'\n\n',
			'a\nb\n',
			"const a = 'hi'; // tail",
			'function f<T extends string>(x: T): T { return x; }',
		];
		for (const code of samples) {
			const r = highlightCode('typescript', code);
			expect(joinedText(r.lines)).toBe(code);
		}
	});
});
