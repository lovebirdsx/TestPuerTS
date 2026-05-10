import * as React from 'react';

import { SPACING, VBox } from '../../../../ui';

import { DiffView } from '../blocks';
import { ContentDispatcher } from '../contentDispatcher';
import { asContentArray, isDiffBlock, type AcpDiffBlock } from '../contentTypes';
import { extractPrimaryPath } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

/**
 * `edit` 类工具：content[] 通常包含一个或多个 `type: 'diff'` 块（path / oldText / newText）。
 * 没有 diff 块时退回 ContentDispatcher（兜底）。
 */
const EditBody: React.FC<BodyProps> = ({ item }) => {
	const blocks = asContentArray(item.content);
	const diffs: AcpDiffBlock[] = blocks ? blocks.filter(isDiffBlock) : [];

	if (diffs.length === 0) {
		return <ContentDispatcher value={item.content} />;
	}

	return (
		<VBox Gap={SPACING.normal}>
			{diffs.map((d, i) => (
				<DiffView key={i} path={d.path} oldText={d.oldText ?? ''} newText={d.newText} />
			))}
		</VBox>
	);
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
