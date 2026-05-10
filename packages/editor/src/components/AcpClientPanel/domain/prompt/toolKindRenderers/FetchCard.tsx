import * as React from 'react';
import type { LinearColor } from 'react-umg';

import { HBox, SelectableText, Text, VBox } from '../../../../ui';

import { ContentDispatcher } from '../contentDispatcher';
import { extractUrl } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };

/**
 * `fetch` 类工具：rawInput.url 是请求 URL，content[] 是响应内容；
 * 走 ContentDispatcher 即可——agent 通常在 content 里自带 text/diff/...。
 */
const FetchBody: React.FC<BodyProps> = ({ item }) => {
	const url = extractUrl(item.rawInput);
	return (
		<VBox Gap={4}>
			{url ? (
				<HBox Gap={6}>
					<Text Text="url:" Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_DIM }} />
					<SelectableText Text={url} Font={{ Size: 9 }} />
				</HBox>
			) : null}
			{item.content !== undefined ? <ContentDispatcher value={item.content} /> : null}
		</VBox>
	);
};

export const FetchCard: KindRenderer = {
	derivePaths: () => [],
	Body: FetchBody,
};
