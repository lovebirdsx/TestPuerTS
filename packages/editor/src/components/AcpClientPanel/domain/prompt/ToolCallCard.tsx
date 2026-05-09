import * as React from 'react';

import { Badge, HBox, IconBtn, Section, Text, VBox } from '../../../ui';
import type { ToolItem } from '../../store';
import { formatUnknown } from '../shared/formatters';

const center = { VerticalAlignment: 2 as any };

type Tone = 'normal' | 'accent' | 'warning' | 'error';

function statusTone(status: string | null | undefined): Tone {
	if (!status) return 'normal';
	const s = status.toLowerCase();
	if (s === 'completed' || s === 'success' || s === 'done') return 'accent';
	if (s === 'failed' || s === 'error' || s === 'cancelled') return 'error';
	if (s === 'in_progress' || s === 'running' || s === 'pending') return 'warning';
	return 'normal';
}

export const ToolCallCard: React.FC<{ item: ToolItem }> = ({ item }) => {
	const [expanded, setExpanded] = React.useState(false);

	const hasInput = item.rawInput !== undefined;
	const hasOutput = item.rawOutput !== undefined;
	const hasContent = item.content !== undefined;
	const hasBody = hasInput || hasOutput || hasContent;
	const tone = statusTone(item.status);

	return (
		<Section Tone="normal" Padding={{ Left: 6, Top: 4, Right: 6, Bottom: 4 }}>
			<HBox Gap={4}>
				<IconBtn
					IconName={expanded ? 'ChevronDown' : 'ChevronRight'}
					ToolTipText=""
					OnClicked={() => setExpanded((v) => !v)}
					bIsEnabled={hasBody}
				/>
				<Badge Text={item.toolKind ?? 'tool'} Slot={center} />
				<Text Text={item.title} Slot={center} />
				{item.status ? <Badge Text={item.status} Tone={tone} Slot={center} /> : undefined}
			</HBox>
			{expanded && hasBody ? (
				<VBox Gap={4}>
					{hasInput ? (
						<VBox Gap={2}>
							<Text Text="Input" />
							<Text Text={formatUnknown(item.rawInput)} AutoWrapText />
						</VBox>
					) : undefined}
					{hasOutput ? (
						<VBox Gap={2}>
							<Text Text="Output" />
							<Text Text={formatUnknown(item.rawOutput)} AutoWrapText />
						</VBox>
					) : undefined}
					{hasContent ? (
						<VBox Gap={2}>
							<Text Text="Content" />
							<Text Text={formatUnknown(item.content)} AutoWrapText />
						</VBox>
					) : undefined}
				</VBox>
			) : undefined}
		</Section>
	);
};
