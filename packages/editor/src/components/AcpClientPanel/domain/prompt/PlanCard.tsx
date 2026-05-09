import * as React from 'react';

import { Badge, HBox, Section, Text, VBox } from '../../../ui';
import type { PlanItem } from '../../store';

const center = { VerticalAlignment: 2 as any };

type Tone = 'normal' | 'accent' | 'warning' | 'error';

function statusTone(status: string | null | undefined): Tone {
	if (!status) return 'normal';
	const s = status.toLowerCase();
	if (s === 'completed' || s === 'done') return 'accent';
	if (s === 'failed' || s === 'cancelled') return 'error';
	if (s === 'in_progress' || s === 'pending') return 'warning';
	return 'normal';
}

export const PlanCard: React.FC<{ item: PlanItem }> = ({ item }) => {
	return (
		<Section Tone="accent" Title="Plan" Padding={{ Left: 6, Top: 4, Right: 6, Bottom: 4 }}>
			<VBox Gap={2}>
				{item.entries.length === 0 ? <Text Text="(empty)" /> : undefined}
				{item.entries.map((entry, index) => (
					<HBox key={index} Gap={4}>
						<Badge Text={entry.status} Tone={statusTone(entry.status)} Slot={center} />
						<Text Text={entry.content} AutoWrapText Slot={center} />
					</HBox>
				))}
			</VBox>
		</Section>
	);
};
