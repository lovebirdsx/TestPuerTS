import { createAcpPanelStore, createMemoryStorage, type UseAcpPanelStore } from 'editor';
import type { AcpClientFactory } from 'editor';
import type { AcpClient, AcpClientOptions } from '@universe-agent/acp-client-ue';

import { MockAcpClient, asClient } from './mockClient';

export interface TestStoreContext {
	store: UseAcpPanelStore;
	mockClients: MockAcpClient[];
	clientFactory: AcpClientFactory;
}

export function createTestStore(
	persistName = `acp-panel-test-${Math.random().toString(36).slice(2, 8)}`,
): TestStoreContext {
	const mockClients: MockAcpClient[] = [];
	const clientFactory: AcpClientFactory = (options: AcpClientOptions): AcpClient => {
		const mock = new MockAcpClient(options);
		mockClients.push(mock);
		return asClient(mock);
	};
	const store = createAcpPanelStore({
		clientFactory,
		persistName,
		storage: createMemoryStorage(),
	});
	return { store, mockClients, clientFactory };
}

/** 等待 zustand persist 异步 hydration 完成。 */
export async function waitHydration(store: UseAcpPanelStore): Promise<void> {
	if (store.persist.hasHydrated()) return;
	await new Promise<void>((resolve) => {
		const off = store.persist.onFinishHydration(() => {
			off();
			resolve();
		});
	});
}

/** 让等待中的 microtasks/promise 链路推进一轮。 */
export function flushMicrotasks(): Promise<void> {
	return Promise.resolve().then(() => Promise.resolve());
}
