import { describe, expect, it } from '../testRunner';
import { createTestStore, flushMicrotasks, waitHydration } from './testStore';

describe('AcpPanel store / session', () => {
	it('session_changed event populates session state and pushes system message', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();

		ctx.mockClients[0]!.mockController.emit({
			type: 'session_changed',
			session: { sessionId: 'sess-1', configOptions: [], modes: undefined } as any,
		});

		const s = ctx.store.getState();
		expect(s.sessionId).toBe('sess-1');
		expect(s.messages.some((m) => m.role === 'system' && m.text.includes('sess-1'))).toBe(true);
	});

	it('newSession warnings render as system messages', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.mockClients[0]!.newSessionImpl = async () => ({ warnings: ['cfg missing'] });

		ctx.store.getState().newSession();
		await flushMicrotasks();
		await flushMicrotasks();

		expect(ctx.store.getState().messages.some((m) => m.text.includes('cfg missing'))).toBe(true);
	});

	it('loadSession requires non-empty session id and pushes warnings', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.mockClients[0]!.loadSessionImpl = async (id) => ({ warnings: [`loaded ${id}`] });

		ctx.store.setState((s) => ({ ...s, sessionToLoad: '   ' }));
		ctx.store.getState().loadSession();
		await flushMicrotasks();
		expect(ctx.mockClients[0]!.loadSessionCalls.length).toBe(0);

		ctx.store.setState((s) => ({ ...s, sessionToLoad: 'abc' }));
		ctx.store.getState().loadSession();
		await flushMicrotasks();
		await flushMicrotasks();
		expect(ctx.mockClients[0]!.loadSessionCalls).toEqual(['abc']);
		expect(ctx.store.getState().messages.some((m) => m.text.includes('loaded abc'))).toBe(true);
	});

	it('setMode/setConfigOption forward to controller', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.getState().setMode('mode-x');
		ctx.store.getState().setConfigOption('opt-a', true);
		await flushMicrotasks();
		expect(ctx.mockClients[0]!.mockController.lastMode).toBe('mode-x');
		expect(ctx.mockClients[0]!.mockController.lastConfigOption).toEqual({ optionId: 'opt-a', value: true });
	});
});
