import * as React from 'react';
import type { LinearColor } from 'react-umg';

import { HBox, SelectableText, Text } from '../../../../ui';

import type { BodyProps, KindRenderer } from './types';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };

function isObj(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null;
}

function asString(v: unknown): string | undefined {
	return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function extractModes(input: unknown): { from?: string; to?: string } {
	if (!isObj(input)) return {};
	const from = asString(input.oldMode) ?? asString(input.previous_mode) ?? asString(input.from);
	const to = asString(input.newMode) ?? asString(input.mode) ?? asString(input.to);
	return { from, to };
}

/** `switch_mode` 类工具：单行展示 `from → to`；没字段就什么都不显示。 */
const SwitchModeBody: React.FC<BodyProps> = ({ item }) => {
	const { from, to } = extractModes(item.rawInput);
	if (!from && !to) return null;
	return (
		<HBox Gap={6}>
			{from ? <SelectableText Text={from} Font={{ Size: 9 }} /> : null}
			<Text Text="→" Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_DIM }} />
			{to ? <SelectableText Text={to} Font={{ Size: 9 }} /> : null}
		</HBox>
	);
};

export const SwitchModeCard: KindRenderer = {
	derivePaths: () => [],
	Body: SwitchModeBody,
};
