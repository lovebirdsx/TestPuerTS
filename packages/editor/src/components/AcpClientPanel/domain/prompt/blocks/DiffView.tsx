import * as React from 'react';
import type { LinearColor } from 'react-umg';

import { Btn, HBox, Section, SelectableText, SPACING, Text } from '../../../../ui';

import { computeDiffRows, type DiffRow } from './diffMath';

const COL_DIM: LinearColor = { R: 0.55, G: 0.55, B: 0.55, A: 1 };
const COL_RED: LinearColor = { R: 0.95, G: 0.45, B: 0.45, A: 1 };
const COL_GREEN: LinearColor = { R: 0.45, G: 0.85, B: 0.45, A: 1 };

interface DiffViewProps {
	oldText: string;
	newText: string;
	/** 仅作为提示信息，不影响 diff 计算。 */
	path?: string | null;
	/** 默认折叠时显示的最大行数，超过后追加 "show N more" 按钮。 */
	maxRows?: number;
}

function rowPrefix(kind: DiffRow['kind']): string {
	if (kind === 'add') return '+ ';
	if (kind === 'del') return '- ';
	return '  ';
}

function rowColor(kind: DiffRow['kind']): LinearColor {
	if (kind === 'add') return COL_GREEN;
	if (kind === 'del') return COL_RED;
	return COL_DIM;
}

export const DiffView: React.FC<DiffViewProps> = ({ oldText, newText, path, maxRows = 60 }) => {
	const [showAll, setShowAll] = React.useState(false);
	const { rows, summary } = React.useMemo(() => computeDiffRows(oldText, newText), [oldText, newText]);

	const visibleCount = showAll ? rows.length : Math.min(maxRows, rows.length);
	const hidden = rows.length - visibleCount;
	const visible = rows.slice(0, visibleCount);

	return (
		<Section Tone="normal" Gap={SPACING.tight}>
			<HBox Gap={SPACING.wide}>
				<Text Text={`+${summary.added}`} Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_GREEN }} />
				<Text Text={`-${summary.removed}`} Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_RED }} />
				{path ? <Text Text={path} Font={{ Size: 9 }} ColorAndOpacity={{ SpecifiedColor: COL_DIM }} /> : null}
			</HBox>
			{visible.map((row, i) => (
				<SelectableText
					key={i}
					Text={`${rowPrefix(row.kind)}${row.text}`}
					AutoWrapText
					Font={{ Size: 9 }}
					ColorAndOpacity={{ SpecifiedColor: rowColor(row.kind) }}
				/>
			))}
			{hidden > 0 ? (
				<Btn OnClicked={() => setShowAll(true)}>
					<Text
						Text={`… show ${hidden} more line${hidden > 1 ? 's' : ''}`}
						Font={{ Size: 9 }}
						ColorAndOpacity={{ SpecifiedColor: COL_DIM }}
					/>
				</Btn>
			) : null}
		</Section>
	);
};
