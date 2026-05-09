import * as React from 'react';
import { Spacer } from 'react-umg';

import { HBox, IconBtn } from '../../../ui';
import { useStoreAction, useStoreSelector } from '../../hooks/useStore';

const center = { VerticalAlignment: 2 as any };

export const TopBar: React.FC = () => {
	const hasClient = useStoreSelector((s) => s.client !== undefined);
	const connected = useStoreSelector((s) => s.status === 'connected');
	const activeDrawer = useStoreSelector((s) => s.activeDrawer);
	const protocolCount = useStoreSelector((s) => s.protocol.length);

	const connect = useStoreAction('connect');
	const disconnect = useStoreAction('disconnect');
	const newSession = useStoreAction('newSession');
	const toggleDrawer = useStoreAction('toggleDrawer');
	const exportProtocol = useStoreAction('exportProtocol');
	const logStateToConsole = useStoreAction('logStateToConsole');

	return (
		<HBox Gap={4}>
			<IconBtn
				IconName="Plus"
				ToolTipText="New session"
				OnClicked={newSession}
				bIsEnabled={connected}
				Slot={center}
			/>
			<IconBtn
				IconName="Recent"
				ToolTipText="History"
				Active={activeDrawer === 'history'}
				OnClicked={() => toggleDrawer('history')}
				Slot={center}
			/>
			<IconBtn
				IconName="Settings"
				ToolTipText="Settings"
				Active={activeDrawer === 'settings'}
				OnClicked={() => toggleDrawer('settings')}
				Slot={center}
			/>
			<Spacer Slot={{ Size: { SizeRule: 1, Value: 1 } }} />
			<IconBtn
				IconName="Save"
				ToolTipText="Export protocol JSON"
				OnClicked={() => void exportProtocol()}
				bIsEnabled={protocolCount > 0}
				Slot={center}
			/>
			<IconBtn IconName="Info" ToolTipText="Log state to console" OnClicked={logStateToConsole} Slot={center} />
			<IconBtn
				IconName={hasClient ? 'Unlink' : 'Link'}
				ToolTipText={hasClient ? 'Disconnect' : 'Connect'}
				OnClicked={hasClient ? () => void disconnect() : connect}
				Slot={center}
			/>
		</HBox>
	);
};
