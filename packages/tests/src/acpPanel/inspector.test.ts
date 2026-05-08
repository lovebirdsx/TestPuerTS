import { describe, expect, it } from '../testRunner';
import { createTestStore, waitHydration } from './testStore';

const SID = 'test-session';

describe('AcpPanel store / inspector', () => {
	it('plan_updated populates plan tab', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		ctx.mockClients[0]!.mockController.emit({
			type: 'plan_updated',
			sessionId: SID,
			entries: [{ content: 'a', status: 'pending', priority: 'high' }],
		});
		expect(ctx.store.getState().plan.length).toBe(1);
	});

	it('tool_call_updated upserts entries by toolCallId', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		const ctrl = ctx.mockClients[0]!.mockController;
		ctrl.emit({ type: 'tool_call_updated', sessionId: SID, toolCallId: 't1', title: 'T1', status: 'pending' });
		ctrl.emit({ type: 'tool_call_updated', sessionId: SID, toolCallId: 't1', title: 'T1', status: 'completed' });
		ctrl.emit({ type: 'tool_call_updated', sessionId: SID, toolCallId: 't2', title: 'T2' });
		const tools = ctx.store.getState().tools;
		expect(tools.length).toBe(2);
		expect(tools[0]!.status).toBe('completed');
		expect(tools[1]!.id).toBe('t2');
	});

	it('protocol_message respects 200-entry cap', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		const ctrl = ctx.mockClients[0]!.mockController;
		for (let i = 0; i < 250; i++) {
			ctrl.emit({
				type: 'protocol_message',
				direction: 'send',
				message: { jsonrpc: '2.0', method: 'test', params: i } as any,
			});
		}
		expect(ctx.store.getState().protocol.length).toBe(200);
	});

	it('clearProtocol empties the protocol log', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.mockClients[0]!.mockController.emit({
			type: 'protocol_message',
			direction: 'recv',
			message: { jsonrpc: '2.0', method: 'x' } as any,
		});
		expect(ctx.store.getState().protocol.length).toBe(1);
		ctx.store.getState().clearProtocol();
		expect(ctx.store.getState().protocol.length).toBe(0);
	});

	it('setActiveTab switches inspector tab', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().setActiveTab('protocol');
		expect(ctx.store.getState().activeTab).toBe('protocol');
	});

	it('usage_updated populates usage', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		ctx.mockClients[0]!.mockController.emit({ type: 'usage_updated', sessionId: SID, size: 200000, used: 1234 });
		expect(ctx.store.getState().usage).toEqual({ size: 200000, used: 1234 });
	});

	it('commands_updated populates commands tab', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		ctx.mockClients[0]!.mockController.emit({
			type: 'commands_updated',
			sessionId: SID,
			commands: [{ name: 'help', description: 'show help' }],
		});
		expect(ctx.store.getState().commands.length).toBe(1);
	});
});
