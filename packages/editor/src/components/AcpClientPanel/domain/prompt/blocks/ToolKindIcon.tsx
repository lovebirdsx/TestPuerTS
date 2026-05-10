import * as React from 'react';

import { Icon, type IconName } from '../../../../ui';

/**
 * ACP `ToolKind` → 编辑器内置图标的映射。
 * 全部从 `_ICON_NAMES` 已声明的集合里挑选，未命中走 'Plus' 兜底。
 */
const KIND_TO_ICON: Record<string, IconName> = {
	read: 'Search',
	edit: 'Edit',
	delete: 'Delete',
	move: 'Refresh',
	search: 'Filter',
	execute: 'Launch',
	think: 'Help',
	fetch: 'Download',
	switch_mode: 'Settings',
	other: 'Plus',
};

export const ToolKindIcon: React.FC<{ kind?: string | null; size?: number; Slot?: any }> = ({ kind, size, Slot }) => {
	const name = kind ? (KIND_TO_ICON[kind] ?? 'Plus') : 'Plus';
	return <Icon Name={name} Size={size ?? 12} Slot={Slot} />;
};
