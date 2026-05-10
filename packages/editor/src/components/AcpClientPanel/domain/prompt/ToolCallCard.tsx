import * as React from 'react';

import { Badge, HBox, IconBtn, Section, SelectableText, SPACING, VBox } from '../../../ui';
import type { ToolItem } from '../../store';

import { PathChip, ToolKindIcon } from './blocks';
import { getRendererForKind } from './toolKindRenderers';

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
		if (typeof record.description === 'string') {
			return record.description;
		}
	}
	return '';
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

const PATH_CHIP_LIMIT = 3;

export const ToolCallCard: React.FC<{ item: ToolItem }> = ({ item }) => {
	const [expanded, setExpanded] = React.useState(false);

	const renderer = getRendererForKind(item.toolKind);
	const paths = renderer.derivePaths(item).slice(0, PATH_CHIP_LIMIT);
	const description = toolDescription(item);
	const tone = statusTone(item.status);

	// 是否有任何可展开的内容：rawInput / rawOutput / content 任一不为 undefined
	const hasBody = item.rawInput !== undefined || item.rawOutput !== undefined || item.content !== undefined;

	return (
		<Section Tone="normal">
			<VBox Gap={SPACING.normal}>
				<HBox Gap={SPACING.normal}>
					<IconBtn
						Size={8}
						IconName={expanded ? 'ChevronDown' : 'ChevronRight'}
						ToolTipText=""
						OnClicked={() => setExpanded((v) => !v)}
						bIsEnabled={hasBody}
					/>
					<ToolKindIcon kind={item.toolKind} />
					<Badge Text={item.toolKind ?? 'tool'} Tone="normal" Slot={center} />
					{description ? <SelectableText Text={description} Slot={center} Font={{ Size: 9 }} /> : null}
					{paths.map((p, i) => (
						<PathChip key={i} path={p.path} line={p.line} dense />
					))}
					{item.status ? (
						tone === 'warning' ? (
							<AnimatedBadge text={item.status} />
						) : (
							<Badge Text={item.status} Tone={tone} Slot={center} />
						)
					) : null}
				</HBox>
				{expanded && hasBody ? <renderer.Body item={item} /> : null}
			</VBox>
		</Section>
	);
};
