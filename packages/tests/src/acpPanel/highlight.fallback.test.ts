import { detectLanguageByPath, fallbackHighlight, highlightCode, type CodeToken } from 'editor';

import { describe, expect, it } from '../testRunner';

function flatten(tokens: CodeToken[][]): { text: string; className?: string }[] {
	const out: { text: string; className?: string }[] = [];
	for (const line of tokens) {
		for (const t of line) {
			out.push({ text: t.text, ...(t.className ? { className: t.className } : {}) });
		}
	}
	return out;
}

function classNames(tokens: CodeToken[][]): string[] {
	const out: string[] = [];
	for (const line of tokens) {
		for (const t of line) {
			if (t.className) {
				out.push(t.className);
			}
		}
	}
	return out;
}

describe('AcpPanel highlight / fallback', () => {
	it('typescript: const / function / string / number / line comment / block comment', () => {
		const r = fallbackHighlight(
			'typescript',
			[
				'// hello',
				'const x: number = 42;',
				'function f(s: string) { return s + "ok"; }',
				'/* multi',
				'   line */',
				'let y = 0.5e2;',
			].join('\n'),
		);

		expect(r.fallback).toBe(true);
		expect(r.language).toBe('typescript');
		expect(r.lines.length).toBe(6);

		const cls = classNames(r.lines);
		expect(cls.includes('hljs-keyword')).toBe(true); // const / function / let / return
		expect(cls.includes('hljs-string')).toBe(true);
		expect(cls.includes('hljs-number')).toBe(true);
		expect(cls.includes('hljs-comment')).toBe(true);

		// 行注释占满整行
		const firstLineComment = r.lines[0]!.find((t) => t.className === 'hljs-comment');
		expect(firstLineComment?.text).toBe('// hello');

		// 块注释跨行 —— 第 4、5 行都该标 comment
		const line4Cls = r.lines[3]!.map((t) => t.className);
		const line5Cls = r.lines[4]!.map((t) => t.className);
		expect(line4Cls.includes('hljs-comment')).toBe(true);
		expect(line5Cls.includes('hljs-comment')).toBe(true);
	});

	it('json: true/false/null are keywords; strings and numbers tagged', () => {
		const r = fallbackHighlight('json', '{"name":"x","ok":true,"n":12,"v":null}');
		const cls = classNames(r.lines);
		expect(cls.includes('hljs-keyword')).toBe(true);
		expect(cls.includes('hljs-string')).toBe(true);
		expect(cls.includes('hljs-number')).toBe(true);
	});

	it('bash: keywords + builtins + line comment', () => {
		const r = fallbackHighlight('bash', ['# do work', 'if [ -f x ]; then', '  echo hi', 'fi'].join('\n'));
		const cls = classNames(r.lines);
		expect(cls.includes('hljs-keyword')).toBe(true); // if / then / fi
		expect(cls.includes('hljs-built_in')).toBe(true); // echo
		expect(cls.includes('hljs-comment')).toBe(true);
	});

	it('diff: +/- lines tagged as addition/deletion; @@ as meta', () => {
		const r = fallbackHighlight('diff', ['@@ -1,3 +1,3 @@', '-old line', '+new line', ' context'].join('\n'));
		const flat = flatten(r.lines);
		expect(flat[0]!.className).toBe('hljs-meta');
		expect(flat[1]!.className).toBe('hljs-deletion');
		expect(flat[2]!.className).toBe('hljs-addition');
		expect(flat[3]!.className).toBeUndefined();
	});

	it('unknown language degrades to plain', () => {
		const r = fallbackHighlight('klingon', 'qapla');
		expect(r.language).toBe('klingon');
		expect(r.fallback).toBe(true);
		expect(classNames(r.lines).length).toBe(0);
	});

	it('null language degrades to plain too', () => {
		const r = fallbackHighlight(null, 'just text\nmore');
		expect(r.language).toBe(null);
		expect(r.lines.length).toBe(2);
	});
});

describe('AcpPanel highlight / facade', () => {
	it('highlightCode prefers lowlight when language is supported', () => {
		const r = highlightCode('typescript', 'const x = 1;');
		expect(r.fallback).toBe(false);
		expect(classNames(r.lines).includes('hljs-keyword')).toBe(true);
	});

	it('highlightCode falls back when language has no loader', () => {
		const r = highlightCode('klingon', 'qapla');
		expect(r.fallback).toBe(true);
	});

	it('highlightCode falls back when language is null', () => {
		const r = highlightCode(null, 'plain text');
		expect(r.fallback).toBe(true);
	});
});

describe('AcpPanel highlight / detectLanguageByPath', () => {
	it('maps common extensions', () => {
		expect(detectLanguageByPath('foo/bar.ts')).toBe('typescript');
		expect(detectLanguageByPath('a.tsx')).toBe('typescript');
		expect(detectLanguageByPath('a.JSON')).toBe('json');
		expect(detectLanguageByPath('build.sh')).toBe('bash');
		expect(detectLanguageByPath('app.py')).toBe('python');
		expect(detectLanguageByPath('Foo.cpp')).toBe('cpp');
		expect(detectLanguageByPath('config.ini')).toBe('ini');
		expect(detectLanguageByPath('README.md')).toBe('markdown');
	});

	it('returns undefined for unknown / missing extension', () => {
		expect(detectLanguageByPath(undefined)).toBeUndefined();
		expect(detectLanguageByPath(null)).toBeUndefined();
		expect(detectLanguageByPath('Makefile')).toBeUndefined();
		expect(detectLanguageByPath('foo.xyz')).toBeUndefined();
	});
});
