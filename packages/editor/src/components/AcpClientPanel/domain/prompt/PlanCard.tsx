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

// 运行中状态（warning tone）使用闪烁动画
const AnimatedBadge: React.FC<{ text: string }> = ({ text }) => {
	const [blink, setBlink] = React.useState(false);
	React.useEffect(() => {
		const id = setInterval(() => setBlink((b) => !b), 600);
		return () => clearInterval(id);
	}, []);
	return <Badge Text={text} Tone={blink ? 'warning' : 'normal'} Slot={center} />;
};

export const PlanCard: React.FC<{ item: PlanItem }> = ({ item }) => {
	return (
		<Section Tone="accent" Title="Plan" Padding={{ Left: 6, Top: 4, Right: 6, Bottom: 4 }}>
			<VBox Gap={2}>
				{item.entries.length === 0 ? <Text Text="(empty)" /> : undefined}
				{item.entries.map((entry, index) => (
					<HBox key={index} Gap={4}>
						{statusTone(entry.status) === 'warning' ? (
							<AnimatedBadge text={entry.status} />
						) : (
							<Badge Text={entry.status} Tone={statusTone(entry.status)} Slot={center} />
						)}
						<Text Text={entry.content} AutoWrapText Slot={center} />
					</HBox>
				))}
			</VBox>
		</Section>
	);
};
