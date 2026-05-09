import * as React from 'react';

import { Btn, Section, Select, Text, VBox } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import { Inspector } from '../inspector/Inspector';
import { SessionPicker } from '../session/SessionPicker';
import { Sidebar } from '../session/Sidebar';
import { toTArray } from '../shared/ueArray';
import type { DrawerKey } from '../../store';
import { Drawer } from './Drawer';

// ──────────────────────────────────────────────────────────────────────────
// Connection 子区（原 ConnectionToolbar 中可持久化的连接选择部分）
// ──────────────────────────────────────────────────────────────────────────

const ConnectionSettings: React.FC = () => {
	const connections = useStoreSelector((s) => s.connections);
	const activeConnectionId = useStoreSelector((s) => s.config.activeConnectionId);
	const autoConnect = useStoreSelector((s) => s.config.startup.autoConnect);
	const setActiveConnectionId = useStoreAction('setActiveConnectionId');
	const setAutoConnect = useStoreAction('setAutoConnect');

	const connectionOptions = connections.map((c) => c.label);
	const activeProfile = connections.find((c) => c.id === activeConnectionId) ?? connections[0];
	const selectedOption = activeProfile?.label ?? '';

	const handleConnectionSelect = (label: string) => {
		const profile = connections.find((c) => c.label === label);
		if (profile) setActiveConnectionId(profile.id);
	};

	return (
		<Section Title="Connection">
			{connections.length > 0 ? (
				<VBox Gap={2}>
					<Text Text="Profile" />
					<Select
						DefaultOptions={toTArray(connectionOptions)}
						SelectedOption={selectedOption}
						OnSelectionChanged={handleConnectionSelect}
					/>
				</VBox>
			) : (
				<Text Text="No connection profiles configured." />
			)}
			<Btn OnClicked={() => setAutoConnect(!autoConnect)}>
				<Text Text={`${autoConnect ? '[x]' : '[ ]'} Auto Connect`} />
			</Btn>
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// DrawerHost：根据 activeDrawer 选择渲染哪个子面板
// ──────────────────────────────────────────────────────────────────────────

export const DrawerHost: React.FC<{ active: DrawerKey }> = ({ active }) => {
	const setActiveDrawer = useStoreAction('setActiveDrawer');
	const close = React.useCallback(() => setActiveDrawer(undefined), [setActiveDrawer]);

	if (active === 'history') {
		return (
			<Drawer title="Sessions" onClose={close}>
				<SessionPicker />
			</Drawer>
		);
	}
	if (active === 'settings') {
		return (
			<Drawer title="Settings" onClose={close}>
				<VBox Gap={6}>
					<ConnectionSettings />
					<Sidebar />
				</VBox>
			</Drawer>
		);
	}
	return (
		<Drawer title="Debug" onClose={close}>
			<Inspector />
		</Drawer>
	);
};
