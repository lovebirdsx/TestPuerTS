import * as React from 'react';

import { Badge, HBox, IconBtn, Section, SelectableText, Text, VBox } from '../../../ui';
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

function toolDescription(item: ToolItem): string {
	if (item.rawInput && typeof item.rawInput === 'object') {
		const record = item.rawInput as Record<string, unknown>;
		if (record.description && typeof record.description === 'string') {
			return record.description;
		}
	}

	return '';
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
					Size={8}
					IconName={expanded ? 'ChevronDown' : 'ChevronRight'}
					ToolTipText=""
					OnClicked={() => setExpanded((v) => !v)}
					bIsEnabled={hasBody}
				/>
				<Badge Text={item.toolKind ?? 'tool'} Slot={center} />
				<SelectableText Text={toolDescription(item)} Slot={center} />
				{item.status ? <Badge Text={item.status} Tone={tone} Slot={center} /> : undefined}
			</HBox>
			{expanded && hasBody ? (
				<VBox Gap={4}>
					{hasInput ? (
						<VBox Gap={2}>
							<Text Text="Input" />
							<SelectableText Text={formatUnknown(item.rawInput)} AutoWrapText />
						</VBox>
					) : undefined}
					{hasOutput ? (
						<VBox Gap={2}>
							<Text Text="Output" />
							<SelectableText Text={formatUnknown(item.rawOutput)} AutoWrapText />
						</VBox>
					) : undefined}
					{hasContent ? (
						<VBox Gap={2}>
							<Text Text="Content" />
							<SelectableText Text={formatUnknown(item.content)} AutoWrapText />
						</VBox>
					) : undefined}
				</VBox>
			) : undefined}
		</Section>
	);
};
