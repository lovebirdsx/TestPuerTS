import * as React from 'react';

import { ContentDispatcher } from '../contentDispatcher';
import { extractPrimaryPath } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

/** `delete` 类工具：被删的路径已经放在头部 PathChip 里，body 仅在有 content[] 时透出。 */
const DeleteBody: React.FC<BodyProps> = ({ item }) => {
	if (item.content === undefined) return null;
	return <ContentDispatcher value={item.content} />;
};

export const DeleteCard: KindRenderer = {
	derivePaths: (item) => {
		const p = extractPrimaryPath(item.rawInput);
		return p ? [p] : [];
	},
	Body: DeleteBody,
};
