import * as React from 'react';
import type { LinearColor } from 'react-umg';

import { HBox, Text } from '../../../../ui';
import { PathChip } from '../blocks';

import { ContentDispatcher } from '../contentDispatcher';
import type { ExtractedPath } from './sharedExtractors';
import type { BodyProps, KindRenderer } from './types';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };

function isObj(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | undefined {
	return typeof v === 'string' && v.length > 0 ? v : undefined;
}

interface MovePair {
	from?: string;
	to?: string;
}

function extractMovePair(input: unknown): MovePair {
	if (!isObj(input)) return {};
	const from = asString(input.from) ?? asString(input.source) ?? asString(input.old_path) ?? asString(input.oldPath);
	const to = asString(input.to) ?? asString(input.target) ?? asString(input.new_path) ?? asString(input.newPath);
	return { from, to };
}

/** `move` 类工具：body 里以「from → to」单行展示，加一个 PathChip 行便于点击两端。 */
const MoveBody: React.FC<BodyProps> = ({ item }) => {
	const { from, to } = extractMovePair(item.rawInput);
	if (!from && !to) {
		return <ContentDispatcher value={item.content} />;
	}
	return (
		<HBox Gap={6}>
			{from ? <PathChip path={from} dense /> : null}
			<Text Text="→" Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_DIM }} />
			{to ? <PathChip path={to} dense /> : null}
		</HBox>
	);
};

export const MoveCard: KindRenderer = {
	derivePaths: (item) => {
		const { from, to } = extractMovePair(item.rawInput);
		const out: ExtractedPath[] = [];
		if (from) out.push({ path: from });
		if (to) out.push({ path: to });
		return out;
	},
	Body: MoveBody,
};
