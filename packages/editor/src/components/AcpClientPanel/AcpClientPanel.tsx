import * as React from 'react';
import { HorizontalBox, SizeBox } from 'react-umg';

import { Panel, VBox } from '../ui';
import { ConnectionToolbar } from './domain/connection/ConnectionToolbar';
import { Inspector } from './domain/inspector/Inspector';
import { PermissionModal } from './domain/permission/PermissionModal';
import { MessageStream, PromptBox } from './domain/prompt/PromptArea';
import { SessionPicker } from './domain/session/SessionPicker';
import { Sidebar } from './domain/session/Sidebar';
import { StoreProvider, useHydration, useStoreAction, useStoreSelector } from './hooks/useStore';
import { createAcpPanelStore, type UseAcpPanelStore } from './store';
import type { AcpPanelStoreOptions } from './types';

const PanelBody: React.FC = () => {
	const hydrated = useHydration();
	const autoConnect = useStoreSelector((s) => s.config.startup.autoConnect);
	const hasClient = useStoreSelector((s) => s.client !== undefined);
	const connect = useStoreAction('connect');
	const disconnect = useStoreAction('disconnect');
	const loadConnections = useStoreAction('loadConnections');

	// 卸载时统一释放 client（含 MCP）
	React.useEffect(() => {
		return () => {
			void disconnect();
		};
	}, [disconnect]);

	// hydration 完成后加载连接配置，并按需自动连接（仅触发一次）
	const autoConnectFiredRef = React.useRef(false);
	React.useEffect(() => {
		if (!hydrated || autoConnectFiredRef.current) return;
		autoConnectFiredRef.current = true;
		void loadConnections().then(() => {
			if (autoConnect && !hasClient) connect();
		});
	}, [hydrated, autoConnect, hasClient, connect, loadConnections]);

	return (
		<Panel Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
			<VBox Gap={6} Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
				<ConnectionToolbar />
				<HorizontalBox Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
					<SizeBox WidthOverride={220}>
						<SessionPicker />
					</SizeBox>
					<SizeBox WidthOverride={260}>
						<Sidebar />
					</SizeBox>
					<VBox Gap={6} Slot={{ Size: { SizeRule: 1, Value: 1 } }}>
						<MessageStream />
						<PromptBox />
					</VBox>
					<SizeBox WidthOverride={340}>
						<Inspector />
					</SizeBox>
				</HorizontalBox>
				<PermissionModal />
			</VBox>
		</Panel>
	);
};

export interface AcpClientPanelProps {
	/** 测试可注入隔离 store；不传则使用模块级单例。 */
	store?: UseAcpPanelStore;
	/** 等价于 createAcpPanelStore(options) 后注入；store 优先级更高。 */
	storeOptions?: AcpPanelStoreOptions;
}

export const AcpClientPanel: React.FC<AcpClientPanelProps> = ({ store, storeOptions }) => {
	const ownedStore = React.useMemo<UseAcpPanelStore | undefined>(() => {
		if (store) return undefined;
		if (storeOptions) return createAcpPanelStore(storeOptions);
		return undefined;
	}, [store, storeOptions]);

	const active = store ?? ownedStore;
	if (!active) return <PanelBody />;
	return (
		<StoreProvider value={active}>
			<PanelBody />
		</StoreProvider>
	);
};
