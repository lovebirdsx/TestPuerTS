import * as React from 'react';
import type { LinearColor } from 'react-umg';

import { HBox, SelectableText, SPACING, Text, VBox } from '../../../../ui';

import { ContentDispatcher } from '../contentDispatcher';
import { extractPattern } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };

/**
 * `search` 类工具：rawInput.pattern / .query 是搜索关键词；content[] 是命中文本。
 * 命中条目走 ContentDispatcher（多 text 块），头部一行显示 pattern。
 */
const SearchBody: React.FC<BodyProps> = ({ item }) => {
	const pattern = extractPattern(item.rawInput);
	return (
		<VBox Gap={SPACING.normal}>
			{pattern ? (
				<HBox Gap={SPACING.loose}>
					<Text Text="pattern:" Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_DIM }} />
					<SelectableText Text={pattern} Font={{ Size: 9 }} />
				</HBox>
			) : null}
			{item.content !== undefined ? <ContentDispatcher value={item.content} /> : null}
		</VBox>
	);
};

export const SearchCard: KindRenderer = {
	derivePaths: () => [],
	Body: SearchBody,
};
