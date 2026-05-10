import * as React from 'react';
import type { LinearColor } from 'react-umg';

import { SelectableText, SPACING, Text, VBox } from '../../../ui';
import { formatUnknown } from '../shared/formatters';

import { DiffView, TerminalBlock } from './blocks';
import {
	asContentArray,
	getInnerText,
	isContentWrap,
	isDiffBlock,
	isTerminalBlock,
	type AcpContentBlock,
	type AcpImageContentBlock,
} from './contentTypes';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };

interface ContentDispatcherProps {
	value: unknown;
}

/**
 * 把 ACP `ToolCallContent[]` 投影到对应的展示 block。
 *
 * - `text`  → SelectableText
 * - `image` → 占位文字（`[image: mime]`），二期接入预览
 * - `diff`  → DiffView
 * - `terminal` → TerminalBlock 占位（terminalId 显示，后续接 `terminal/output`）
 * - 其它  → formatUnknown 兜底
 */
export const ContentDispatcher: React.FC<ContentDispatcherProps> = ({ value }) => {
	const blocks = asContentArray(value);
	if (!blocks || blocks.length === 0) {
		// 不是数组、或数组里没合法块——直接 dump 兜底，保留可见性
		if (value === undefined) return null;
		return <SelectableText Text={formatUnknown(value)} AutoWrapText Font={{ Size: 9 }} />;
	}

	return (
		<VBox Gap={SPACING.normal}>
			{blocks.map((block, i) => (
				<ContentBlockView key={i} block={block} />
			))}
		</VBox>
	);
};

const ContentBlockView: React.FC<{ block: AcpContentBlock }> = ({ block }) => {
	if (isDiffBlock(block)) {
		return <DiffView path={block.path} oldText={block.oldText ?? ''} newText={block.newText} />;
	}
	if (isTerminalBlock(block)) {
		return <TerminalBlock command={`terminal:${block.terminalId}`} />;
	}
	if (isContentWrap(block)) {
		const text = getInnerText(block);
		if (text !== undefined) {
			return <SelectableText Text={text} AutoWrapText Font={{ Size: 9 }} />;
		}
		const inner = block.content;
		if (inner.type === 'image') {
			const mime = (inner as AcpImageContentBlock).mimeType ?? 'image';
			return <Text Text={`[image: ${mime}]`} Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_DIM }} />;
		}
		// resource_link / audio / 未知 inner —— 走 formatUnknown
		return <SelectableText Text={formatUnknown(inner)} AutoWrapText Font={{ Size: 9 }} />;
	}
	return <SelectableText Text={formatUnknown(block)} AutoWrapText Font={{ Size: 9 }} />;
};
