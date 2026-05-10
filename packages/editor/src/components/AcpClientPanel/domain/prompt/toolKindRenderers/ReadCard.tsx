import * as React from 'react';

import { SPACING, VBox } from '../../../../ui';

import { CodeBlock } from '../blocks';
import { ContentDispatcher } from '../contentDispatcher';
import { asContentArray, getInnerText, isContentWrap } from '../contentTypes';
import { detectLanguageByPath } from '../highlight';
import { extractPrimaryPath } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

/**
 * `read` 类工具：rawInput 给出读取的目标路径；content[] 通常是该文件的文本内容。
 *
 * Body 渲染策略：
 *   1. 优先尝试把 content[] 里第一个 text 块当作完整文件内容，用 CodeBlock + 路径推断语言渲染。
 *   2. 没有 text 块时退回 ContentDispatcher（兜底)。
 */
const ReadBody: React.FC<BodyProps> = ({ item }) => {
	const path = extractPrimaryPath(item.rawInput)?.path;
	const language = path ? (detectLanguageByPath(path) ?? null) : null;

	const blocks = asContentArray(item.content);
	const fileText = blocks
		?.map((b) => (isContentWrap(b) ? getInnerText(b) : undefined))
		.find((t): t is string => typeof t === 'string');

	if (fileText !== undefined) {
		return (
			<VBox Gap={SPACING.normal}>
				<CodeBlock code={fileText} language={language} />
			</VBox>
		);
	}

	return <ContentDispatcher value={item.content} />;
};

export const ReadCard: KindRenderer = {
	derivePaths: (item) => {
		const p = extractPrimaryPath(item.rawInput);
		return p ? [p] : [];
	},
	Body: ReadBody,
};
