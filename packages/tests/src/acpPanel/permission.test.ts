import { describe, expect, it } from '../testRunner';
import { createTestStore, waitHydration } from './testStore';

describe('AcpPanel store / permission', () => {
	it('permission_requested stores pending and resolve forwards optionId', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();

		let resolvedWith: string | undefined;
		ctx.mockClients[0]!.mockController.emit({
			type: 'permission_requested',
			permission: {
				id: 1,
				request: {
					sessionId: 's',
					toolCall: { toolCallId: 'tc1', title: 'T', kind: 'execute' } as any,
					options: [{ optionId: 'allow', name: 'Allow', kind: 'allow_once' }],
				} as any,
				resolve: (id) => {
					resolvedWith = id;
				},
				cancel: () => {},
			},
		});

		expect(ctx.store.getState().pendingPermission).not.toBe(undefined);

		ctx.store.getState().resolvePermission('allow');
		expect(resolvedWith).toBe('allow');
		expect(ctx.store.getState().pendingPermission).toBe(undefined);
	});

	it('cancelPermission invokes cancel and clears pending', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();

		let cancelled = false;
		ctx.mockClients[0]!.mockController.emit({
			type: 'permission_requested',
			permission: {
				id: 2,
				request: { sessionId: 's', toolCall: { toolCallId: 't' } as any, options: [] } as any,
				resolve: () => {},
				cancel: () => {
					cancelled = true;
				},
			},
		});
		ctx.store.getState().cancelPermission();
		expect(cancelled).toBe(true);
		expect(ctx.store.getState().pendingPermission).toBe(undefined);
	});
});

describe('AcpPanel store / policy', () => {
	it('setPermissionStrategy mirrors to controller', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.getState().setPermissionStrategy('auto-approve');
		expect(ctx.store.getState().permission).toBe('auto-approve');
		expect(ctx.mockClients[0]!.mockController.lastPermissionStrategy).toBe('auto-approve');
	});

	it('setProtocolEnabled mirrors to controller', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.getState().setProtocolEnabled(true);
		expect(ctx.store.getState().protocolEnabled).toBe(true);
		expect(ctx.mockClients[0]!.mockController.lastProtocolEnabled).toBe(true);
	});
});
