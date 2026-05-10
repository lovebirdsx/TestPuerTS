import { computeDiffRows } from 'editor';

import { describe, expect, it } from '../testRunner';

describe('AcpPanel diffView / computeDiffRows', () => {
	it('summary counts add/remove lines correctly', () => {
		const oldText = 'a\nb\nc\n';
		const newText = 'a\nB\nc\nd\n';
		const { summary, rows } = computeDiffRows(oldText, newText);

		expect(summary.added).toBe(2); // B (line 2 changed) + d (new line 4)
		expect(summary.removed).toBe(1); // b
		// 至少应包含 a / c 两个 ctx 行
		expect(rows.some((r) => r.kind === 'ctx' && r.text === 'a')).toBe(true);
		expect(rows.some((r) => r.kind === 'ctx' && r.text === 'c')).toBe(true);
		expect(rows.some((r) => r.kind === 'add' && r.text === 'B')).toBe(true);
		expect(rows.some((r) => r.kind === 'add' && r.text === 'd')).toBe(true);
		expect(rows.some((r) => r.kind === 'del' && r.text === 'b')).toBe(true);
	});

	it('identical text yields zero add/remove', () => {
		const text = 'foo\nbar\nbaz\n';
		const { summary, rows } = computeDiffRows(text, text);
		expect(summary.added).toBe(0);
		expect(summary.removed).toBe(0);
		// 全部 ctx，行数与原文本一致
		expect(rows.length).toBe(3);
		expect(rows.every((r) => r.kind === 'ctx')).toBe(true);
	});

	it('does not emit a phantom trailing empty line', () => {
		const oldText = 'a\nb\n';
		const newText = 'a\nb\nc\n';
		const { rows } = computeDiffRows(oldText, newText);
		// 不应出现 text === '' 的伪行
		expect(rows.every((r) => r.text !== '')).toBe(true);
	});

	it('completely different texts: every old line removed and new line added', () => {
		const oldText = 'one\ntwo\n';
		const newText = 'alpha\nbeta\n';
		const { summary } = computeDiffRows(oldText, newText);
		expect(summary.removed).toBe(2);
		expect(summary.added).toBe(2);
	});
});
