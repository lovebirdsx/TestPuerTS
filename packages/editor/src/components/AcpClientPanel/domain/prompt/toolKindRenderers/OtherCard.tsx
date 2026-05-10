import * as React from 'react';

import { SelectableText, Text, VBox } from '../../../../ui';

import { formatUnknown } from '../../shared/formatters';
import { ContentDispatcher } from '../contentDispatcher';
import type { BodyProps, KindRenderer } from './types';

/**
 * 兜底 renderer：对于未识别的 ToolKind 或没接对应 renderer 的 kind，
 * 直接 dump rawInput / rawOutput / content 三段，保留旧行为以便不丢信息。
 */
const OtherBody: React.FC<BodyProps> = ({ item }) => {
	const sections: React.ReactNode[] = [];
	if (item.rawInput !== undefined) {
		sections.push(
			<VBox key="input" Gap={2}>
				<Text Text="Input" Font={{ Size: 9 }} />
				<SelectableText Text={formatUnknown(item.rawInput)} AutoWrapText Font={{ Size: 9 }} />
			</VBox>,
		);
	}
	if (item.rawOutput !== undefined) {
		sections.push(
			<VBox key="output" Gap={2}>
				<Text Text="Output" Font={{ Size: 9 }} />
				<SelectableText Text={formatUnknown(item.rawOutput)} AutoWrapText Font={{ Size: 9 }} />
			</VBox>,
		);
	}
	if (item.content !== undefined) {
		sections.push(
			<VBox key="content" Gap={2}>
				<Text Text="Content" Font={{ Size: 9 }} />
				<ContentDispatcher value={item.content} />
			</VBox>,
		);
	}
	return <VBox Gap={4}>{sections}</VBox>;
};

export const OtherCard: KindRenderer = {
	derivePaths: () => [],
	Body: OtherBody,
};
