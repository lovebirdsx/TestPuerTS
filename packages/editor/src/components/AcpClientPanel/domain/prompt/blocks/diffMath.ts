import { diffLines, type Change } from 'diff';

export interface DiffRow {
	kind: 'add' | 'del' | 'ctx';
	text: string;
}

export interface DiffSummary {
	added: number;
	removed: number;
}

/**
 * 用 jsdiff `diffLines` 计算行级 unified diff。
 * 每个 `Change.value` 是若干行的串拼，按 `\n` 切回独立行；
 * jsdiff 在 trailing newline 处会留下空字符串，丢弃以避免视觉断行。
 */
export function computeDiffRows(oldText: string, newText: string): { rows: DiffRow[]; summary: DiffSummary } {
	const changes: Change[] = diffLines(oldText, newText);
	const rows: DiffRow[] = [];
	let added = 0;
	let removed = 0;
	for (const ch of changes) {
		const value = ch.value ?? '';
		const lines = value.split('\n');
		if (lines.length > 0 && lines[lines.length - 1] === '') {
			lines.pop();
		}
		const kind: DiffRow['kind'] = ch.added ? 'add' : ch.removed ? 'del' : 'ctx';
		for (const line of lines) {
			rows.push({ kind, text: line });
			if (kind === 'add') added++;
			if (kind === 'del') removed++;
		}
	}
	return { rows, summary: { added, removed } };
}
