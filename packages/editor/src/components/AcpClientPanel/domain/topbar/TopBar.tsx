import * as React from 'react';
import { Spacer } from 'react-umg';

import { Badge, COL_FOREGROUND, COL_FOREGROUND_HOVER, HBox, Text, ToolbarButton } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import { shortId } from '../shared/formatters';
import type { DrawerKey } from '../../store';

const center = { VerticalAlignment: 2 as any };

const DrawerToggle: React.FC<{ drawerKey: DrawerKey; label: string }> = ({ drawerKey, label }) => {
	const active = useStoreSelector((s) => s.activeDrawer === drawerKey);
	const toggleDrawer = useStoreAction('toggleDrawer');
	return (
		<ToolbarButton OnClicked={() => toggleDrawer(drawerKey)} Slot={center}>
			<Text Text={label} ColorAndOpacity={{ SpecifiedColor: active ? COL_FOREGROUND_HOVER : COL_FOREGROUND }} />
		</ToolbarButton>
	);
};

export const TopBar: React.FC = () => {
	const status = useStoreSelector((s) => s.status);
	const agentName = useStoreSelector((s) => s.agentName);
	const agentVersion = useStoreSelector((s) => s.agentVersion);
	const sessionId = useStoreSelector((s) => s.sessionId);
	const isPrompting = useStoreSelector((s) => s.isPrompting);
	const hasClient = useStoreSelector((s) => s.client !== undefined);
	const connected = useStoreSelector((s) => s.status === 'connected');

	const connect = useStoreAction('connect');
	const disconnect = useStoreAction('disconnect');
	const cancel = useStoreAction('cancel');
	const newSession = useStoreAction('newSession');

	const agentLabel = agentName ? `${agentName} ${agentVersion}`.trim() : 'ACP Client';
	const sessionLabel = sessionId ? `Session ${shortId(sessionId)}` : 'No session';

	return (
		<HBox Gap={8}>
			<Badge Text={status} Tone={connected ? 'accent' : status === 'error' ? 'error' : 'normal'} Slot={center} />
			<Text Text={agentLabel} Slot={center} />
			<Text Text={sessionLabel} Slot={center} />
			<ToolbarButton OnClicked={newSession} bIsEnabled={connected} Slot={center}>
				<Text Text="+ New" />
			</ToolbarButton>
			<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
			<DrawerToggle drawerKey="history" label="History" />
			<DrawerToggle drawerKey="settings" label="Settings" />
			<DrawerToggle drawerKey="debug" label="Debug" />
			<ToolbarButton OnClicked={hasClient ? () => void disconnect() : connect} Slot={center}>
				<Text Text={hasClient ? 'Disconnect' : 'Connect'} />
			</ToolbarButton>
			<ToolbarButton OnClicked={cancel} bIsEnabled={isPrompting} Slot={center}>
				<Text Text="Cancel" />
			</ToolbarButton>
		</HBox>
	);
};
