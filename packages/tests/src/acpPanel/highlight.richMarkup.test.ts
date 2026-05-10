import { fallbackHighlight, lineToMarkup, linesToMarkup } from 'editor';

import { describe, expect, it } from '../testRunner';

describe('AcpPanel highlight / richMarkup', () => {
	it('escapes < > & " 实体 in plain token', () => {
		const out = lineToMarkup([{ text: 'a<b>&"c' }]);
		expect(out).toBe('a&lt;b&gt;&amp;&quot;c');
	});

	it('wraps tagged token with <className>...</> and escapes inner', () => {
		const out = lineToMarkup([{ text: '<x>', className: 'hljs-keyword' }]);
		expect(out).toBe('<hljs-keyword>&lt;x&gt;</>');
	});

	it('concatenates mixed tagged and plain tokens on a single line', () => {
		const out = lineToMarkup([
			{ text: 'const', className: 'hljs-keyword' },
			{ text: ' ' },
			{ text: 'x', className: 'hljs-variable' },
			{ text: ' = 1' },
		]);
		expect(out).toBe('<hljs-keyword>const</> <hljs-variable>x</> = 1');
	});

	it('returns empty string for empty line', () => {
		expect(lineToMarkup([])).toBe('');
	});

	it('linesToMarkup roundtrips fallback highlight result line count', () => {
		const code = 'const x = 1;\nconst y = 2;\nconst z = 3;';
		const lines = fallbackHighlight('typescript', code).lines;
		const markup = linesToMarkup(lines);
		expect(markup.length).toBe(3);
		// 每行应至少含 keyword 标记
		expect(markup[0]!.includes('<hljs-keyword>const</>')).toBe(true);
		expect(markup[1]!.includes('<hljs-keyword>const</>')).toBe(true);
		expect(markup[2]!.includes('<hljs-keyword>const</>')).toBe(true);
	});

	it('does not double-escape & 内的 entity prefix', () => {
		// 文本里出现 & 不应被解释为实体起始；序列化后必须是 &amp;lt; 而不是 &lt;
		const out = lineToMarkup([{ text: '&lt;' }]);
		expect(out).toBe('&amp;lt;');
	});
});
