import * as React from 'react';

import type { SessionConfigOption } from '@universe-agent/acp-client-ue';
import { Btn, Section, Text, VBox } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';

// ──────────────────────────────────────────────────────────────────────────
// Boolean Options 区
// 注：select 类 configOptions（model / effort 等）已移到 InputArea 底栏内联展示。
// 这里只保留 boolean 类的 configOptions（开关类设置）。
// ──────────────────────────────────────────────────────────────────────────

const BooleanOptionsPanel: React.FC = () => {
	const configOptions = useStoreSelector((s) => s.configOptions);
	const setConfigOption = useStoreAction('setConfigOption');

	const booleanOptions = configOptions.filter(
		(o): o is Extract<SessionConfigOption, { type: 'boolean' }> => o.type === 'boolean',
	);

	if (booleanOptions.length === 0) return null;

	return (
		<Section Title="Session Options">
			{booleanOptions.map((opt) => (
				<Btn key={opt.id} OnClicked={() => setConfigOption(opt.id, !opt.currentValue)}>
					<Text Text={`${opt.currentValue ? '[x]' : '[ ]'} ${opt.name}`} />
				</Btn>
			))}
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// Sidebar 容器
// ──────────────────────────────────────────────────────────────────────────

export const Sidebar: React.FC = () => (
	<VBox Gap={6}>
		<BooleanOptionsPanel />
	</VBox>
);
