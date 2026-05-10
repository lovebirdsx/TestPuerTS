import * as React from 'react';

import { IconBtn, type IconName } from '../../../../ui';

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

export const ToolKindIcon: React.FC<{ kind?: string | null; size?: number }> = ({ kind, size }) => {
	const name: IconName = kind ? (KIND_TO_ICON[kind] ?? 'Plus') : 'Plus';
	return <IconBtn IconName={name} Size={size} ToolTipText="" />;
};
