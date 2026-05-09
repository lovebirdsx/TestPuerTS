import { createAcpPanelStore, createMemoryStorage } from 'editor';

import { describe, expect, it } from '../testRunner';
import { MockAcpClient, asClient } from './mockClient';
import { waitHydration } from './testStore';

describe('AcpPanel store / persistence', () => {
	it('config/policy are persisted across store recreation', async () => {
		const storage = createMemoryStorage();
		const persistName = `persist-test-${Math.random().toString(36).slice(2, 8)}`;
		const clientFactory = (opts: any) => asClient(new MockAcpClient(opts));

		const first = createAcpPanelStore({ clientFactory, persistName, storage });
		await waitHydration(first);
		first.getState().setActiveConnectionId('my-profile');
		first.getState().setAutoConnect(true);
		first.getState().setPermissionStrategy('auto-approve');
		first.getState().setProtocolEnabled(false);

		// 让 zustand persist 把数据写进 storage（写盘是异步 microtask）
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		const second = createAcpPanelStore({ clientFactory, persistName, storage });
		await waitHydration(second);
		const s = second.getState();
		expect(s.config.activeConnectionId).toBe('my-profile');
		expect(s.config.startup.autoConnect).toBe(true);
		expect(s.permission).toBe('auto-approve');
		expect(s.protocolEnabled).toBe(false);
	});

	it('non-persisted runtime state is not restored', async () => {
		const storage = createMemoryStorage();
		const persistName = `persist-runtime-${Math.random().toString(36).slice(2, 8)}`;
		const clientFactory = (opts: any) => asClient(new MockAcpClient(opts));

		const first = createAcpPanelStore({ clientFactory, persistName, storage });
		await waitHydration(first);
		first.setState((s) => ({ ...s, sessionId: 'leak', isPrompting: true }));
		first.getState().setActiveDrawer('history');
		await Promise.resolve();
		await Promise.resolve();

		const second = createAcpPanelStore({ clientFactory, persistName, storage });
		await waitHydration(second);
		// sessionId / isPrompting 是纯运行态，不持久化
		expect(second.getState().sessionId).toBe(undefined);
		expect(second.getState().isPrompting).toBe(false);
		// activeDrawer 通过 config.lastActiveDrawer 持久化，重启后应被恢复
		expect(second.getState().activeDrawer).toBe('history');
	});
});
