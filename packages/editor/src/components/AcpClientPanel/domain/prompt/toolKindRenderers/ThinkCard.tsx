import * as React from 'react';

import { SelectableText } from '../../../../ui';

import { ContentDispatcher } from '../contentDispatcher';
import { extractDescription } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

/**
 * `think` 类工具：通常 rawInput 没结构、content[] 直接是一段 text。
 * Body 优先走 ContentDispatcher，没 content 时退到 rawInput.description / message。
 */
const ThinkBody: React.FC<BodyProps> = ({ item }) => {
	if (item.content !== undefined) {
		return <ContentDispatcher value={item.content} />;
	}
	const desc = extractDescription(item.rawInput);
	if (desc) {
		return <SelectableText Text={desc} AutoWrapText Font={{ Size: 9 }} />;
	}
	return null;
};

export const ThinkCard: KindRenderer = {
	derivePaths: () => [],
	Body: ThinkBody,
};
