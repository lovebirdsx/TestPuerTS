import * as React from 'react';
import { openPath } from '@universe-agent/editor-common';

import { HBox, Icon, SPACING, Text, ToolbarButton } from '../../../../ui';

function shortenPath(path: string, maxSegments = 3): string {
	const norm = path.replace(/\\/g, '/');
	const parts = norm.split('/').filter(Boolean);
	if (parts.length <= maxSegments) {
		return norm;
	}
	return `…/${parts.slice(-maxSegments).join('/')}`;
}

interface PathChipProps {
	path: string;
	line?: number | null;
	/** 紧凑模式：去掉前导 Folder 图标。用于头部一行多个 chip 的场景。 */
	dense?: boolean;
	Slot?: any;
}

export const PathChip: React.FC<PathChipProps> = ({ path, line, dense, Slot }) => {
	const lineSuffix = typeof line === 'number' && line > 0 ? `:${line}` : '';
	const display = shortenPath(path) + lineSuffix;
	const tooltip = path + lineSuffix;
	return (
		<ToolbarButton ToolTipText={tooltip} OnClicked={() => openPath(path)} Slot={Slot}>
			<HBox Gap={SPACING.normal}>
				{dense ? null : <Icon Name="FolderOpen" Size={11} />}
				<Text Text={display} Font={{ Size: 9 }} />
			</HBox>
		</ToolbarButton>
	);
};
