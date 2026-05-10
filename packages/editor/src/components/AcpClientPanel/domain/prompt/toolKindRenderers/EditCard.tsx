import * as React from 'react';

import { SelectableText, SPACING, VBox } from '../../../../ui';

import { DiffView } from '../blocks';
import { ContentDispatcher } from '../contentDispatcher';
import { asContentArray, isDiffBlock, type AcpDiffBlock } from '../contentTypes';
import { extractPrimaryPath } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

const OLD_TEXT_KEYS = ['old_string', 'old_str', 'oldText', 'old_text', 'oldString'] as const;
const NEW_TEXT_KEYS = ['new_string', 'new_str', 'newText', 'new_text', 'newString'] as const;

function deriveDiffFromRawInput(input: unknown): AcpDiffBlock | undefined {
	if (typeof input !== 'object' || input === null) return undefined;
	const record = input as Record<string, unknown>;

	const extracted = extractPrimaryPath(input);
	if (!extracted) return undefined;

	const asStr = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);

	let oldText: string | undefined;
	for (const k of OLD_TEXT_KEYS) {
		oldText = asStr(record[k]);
		if (oldText !== undefined) break;
	}

	let newText: string | undefined;
	for (const k of NEW_TEXT_KEYS) {
		newText = asStr(record[k]);
		if (newText !== undefined) break;
	}

	if (newText === undefined) return undefined;

	return { type: 'diff', path: extracted.path, oldText: oldText ?? null, newText };
}

function deriveContentFromRawInput(input: unknown): string | undefined {
	if (typeof input !== 'object' || input === null) return undefined;
	const record = input as Record<string, unknown>;
	if (typeof record.content === 'string') {
		return record.content;
	}
	return undefined;
}

/**
 * `edit` 类工具：优先从 content[] 的 diff 块渲染，若 server 未下发则从 rawInput 派生。
 */
const EditBody: React.FC<BodyProps> = ({ item }) => {
	// 1. 优先使用 server 下发的 content[] diff 块
	const blocks = asContentArray(item.content);
	const diffs: AcpDiffBlock[] = blocks ? blocks.filter(isDiffBlock) : [];

	if (diffs.length > 0) {
		return (
			<VBox Gap={SPACING.normal}>
				{diffs.map((d, i) => (
					<DiffView key={i} path={d.path} oldText={d.oldText ?? ''} newText={d.newText} />
				))}
			</VBox>
		);
	}

	// 2. content 中没有 diff 块时，尝试从 rawInput 派生（ACP server 可能不下发 content）
	const derived = deriveDiffFromRawInput(item.rawInput);
	if (derived) {
		return (
			<VBox Gap={SPACING.normal}>
				<DiffView path={derived.path} oldText={derived.oldText ?? ''} newText={derived.newText} />
			</VBox>
		);
	}

	// 3. rawInput 中有content时，直接渲染content（可能是纯文本）
	const content = deriveContentFromRawInput(item.rawInput);
	if (content !== undefined) {
		return <SelectableText Text={content} />;
	}

	// 4. 无法派生时，用 rawInput 兜底（避免 content=undefined 导致空白）
	const fallbackValue = item.rawInput !== undefined ? item.rawInput : item.content;
	return <ContentDispatcher value={fallbackValue} />;
};

function paths(item: BodyProps['item']): ReturnType<KindRenderer['derivePaths']> {
	const fromInput = extractPrimaryPath(item.rawInput);
	if (fromInput) return [fromInput];
	const blocks = asContentArray(item.content);
	if (blocks) {
		const diffPaths = blocks.filter(isDiffBlock).map((d) => ({ path: d.path }));
		if (diffPaths.length > 0) return diffPaths;
	}
	return [];
}

export const EditCard: KindRenderer = {
	derivePaths: paths,
	Body: EditBody,
};
