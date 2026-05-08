import * as React from 'react';
import { Spacer } from 'react-umg';

import { Badge, Btn, HBox, Text, ToolbarButton } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';
import { shortId } from '../shared/formatters';

const center = { VerticalAlignment: 2 as any };

export const ConnectionToolbar: React.FC = () => {
	const status = useStoreSelector((s) => s.status);
	const agentName = useStoreSelector((s) => s.agentName);
	const agentVersion = useStoreSelector((s) => s.agentVersion);
	const sessionId = useStoreSelector((s) => s.sessionId);
	const isPrompting = useStoreSelector((s) => s.isPrompting);
	const autoConnect = useStoreSelector((s) => s.config.startup.autoConnect);
	const hasClient = useStoreSelector((s) => s.client !== undefined);

	const connect = useStoreAction('connect');
	const disconnect = useStoreAction('disconnect');
	const cancel = useStoreAction('cancel');
	const setAutoConnect = useStoreAction('setAutoConnect');

	const connected = status === 'connected';
	const agentLabel = agentName ? `${agentName} ${agentVersion}`.trim() : 'ACP Client';
	const sessionLabel = sessionId ? `Session ${shortId(sessionId)}` : 'No session';

	return (
		<HBox Gap={8}>
			<Badge Text={status} Tone={connected ? 'accent' : status === 'error' ? 'error' : 'normal'} Slot={center} />
			<Text Text={agentLabel} Slot={center} />
			<Text Text={sessionLabel} Slot={center} />
			<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
			<HBox Gap={4} Slot={center}>
				<Btn OnClicked={() => setAutoConnect(!autoConnect)}>
					<Text Text={`${autoConnect ? '[x]' : '[ ]'} Auto Connect`} />
				</Btn>
				<ToolbarButton OnClicked={hasClient ? () => void disconnect() : connect}>
					<Text Text={hasClient ? 'Disconnect' : 'Connect'} />
				</ToolbarButton>
				<ToolbarButton OnClicked={cancel} bIsEnabled={isPrompting}>
					<Text Text="Cancel" />
				</ToolbarButton>
			</HBox>
		</HBox>
	);
};
