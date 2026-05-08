import * as React from 'react';

import type { SessionConfigOption } from '@universe-agent/acp-client-ue';
import { Btn, HBox, Section, Select, Text, TextArea, VBox } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import { toTArray } from '../shared/ueArray';

// ──────────────────────────────────────────────────────────────────────────
// 共享子组件
// ──────────────────────────────────────────────────────────────────────────

const SidebarTextArea: React.FC<React.ComponentProps<typeof TextArea>> = (props) => (
	<TextArea AutoWrapText WrapTextAt={230} {...props} />
);

// ──────────────────────────────────────────────────────────────────────────
// Session 操作区
// ──────────────────────────────────────────────────────────────────────────

const SessionPanel: React.FC = () => {
	const sessionToLoad = useStoreSelector((s) => s.sessionToLoad);
	const connected = useStoreSelector((s) => s.status === 'connected');
	const setSessionToLoad = useStoreAction('setSessionToLoad');
	const newSession = useStoreAction('newSession');
	const loadSession = useStoreAction('loadSession');

	return (
		<Section Title="Session">
			<HBox>
				<Btn OnClicked={newSession} bIsEnabled={connected}>
					<Text Text="New" />
				</Btn>
				<Btn OnClicked={loadSession} bIsEnabled={connected && !!sessionToLoad.trim()}>
					<Text Text="Load" />
				</Btn>
			</HBox>
			<SidebarTextArea Text={sessionToLoad} HintText="session id" OnTextChanged={setSessionToLoad} />
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// Policy 区
// ──────────────────────────────────────────────────────────────────────────

const PolicyPanel: React.FC = () => {
	const permission = useStoreSelector((s) => s.permission);
	const protocolEnabled = useStoreSelector((s) => s.protocolEnabled);
	const setPermissionStrategy = useStoreAction('setPermissionStrategy');
	const setProtocolEnabled = useStoreAction('setProtocolEnabled');

	return (
		<Section Title="Policy">
			<Select
				DefaultOptions={toTArray(['interactive', 'auto-approve', 'deny-all'])}
				SelectedOption={permission}
				OnSelectionChanged={(value) => setPermissionStrategy(value as typeof permission)}
			/>
			<Btn OnClicked={() => setProtocolEnabled(!protocolEnabled)}>
				<Text Text={protocolEnabled ? 'Protocol On' : 'Protocol Off'} />
			</Btn>
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// Session Options 区（mode + configOptions）
// ──────────────────────────────────────────────────────────────────────────

const ConfigOptionControl: React.FC<{
	option: SessionConfigOption;
	onChange: (id: string, value: string | boolean) => void;
}> = ({ option, onChange }) => {
	if (option.type === 'select') {
		const opt = option as Extract<SessionConfigOption, { type: 'select' }>;
		const values = opt.options?.map((o) => o.value) ?? [];
		return (
			<VBox Gap={2}>
				<Text Text={opt.name} />
				<Select
					DefaultOptions={toTArray(values)}
					SelectedOption={opt.currentValue ?? values[0]}
					OnSelectionChanged={(value) => onChange(opt.id, value)}
				/>
			</VBox>
		);
	}
	if (option.type === 'boolean') {
		const opt = option as Extract<SessionConfigOption, { type: 'boolean' }>;
		return (
			<Btn OnClicked={() => onChange(opt.id, !opt.currentValue)}>
				<Text Text={`${opt.currentValue ? '[x]' : '[ ]'} ${opt.name}`} />
			</Btn>
		);
	}
	return <Text Text={`${option.name ?? option.id}: unsupported ${option.type}`} />;
};

const SessionOptionsPanel: React.FC = () => {
	const modes = useStoreSelector((s) => s.modes);
	const configOptions = useStoreSelector((s) => s.configOptions);
	const setMode = useStoreAction('setMode');
	const setConfigOption = useStoreAction('setConfigOption');

	const modeIds = modes?.availableModes.map((m) => m.id) ?? [];
	const empty = modeIds.length === 0 && configOptions.length === 0;

	return (
		<Section Title="Session Options">
			{modeIds.length > 0 ? (
				<>
					<Text Text="Mode" />
					<Select
						DefaultOptions={toTArray(modeIds)}
						SelectedOption={modes?.currentModeId}
						OnSelectionChanged={setMode}
					/>
				</>
			) : undefined}
			{configOptions.map((option) => (
				<ConfigOptionControl key={option.id} option={option} onChange={setConfigOption} />
			))}
			{empty ? <Text Text="No session options" /> : undefined}
		</Section>
	);
};

// ──────────────────────────────────────────────────────────────────────────
// Sidebar 容器
// ──────────────────────────────────────────────────────────────────────────

export const Sidebar: React.FC = () => (
	<VBox Gap={6}>
		<SessionPanel />
		<PolicyPanel />
		<SessionOptionsPanel />
	</VBox>
);
