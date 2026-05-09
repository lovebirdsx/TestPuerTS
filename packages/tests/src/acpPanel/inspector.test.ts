import { describe, expect, it } from '../testRunner';
import { createTestStore, waitHydration } from './testStore';

const SID = 'test-session';

describe('AcpPanel store / timeline', () => {
	it('plan_updated appends a single plan card', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		ctx.mockClients[0]!.mockController.emit({
			type: 'plan_updated',
			sessionId: SID,
			entries: [{ content: 'a', status: 'pending', priority: 'high' }],
		});
		const planItems = ctx.store.getState().timeline.filter((i) => i.kind === 'plan');
		expect(planItems.length).toBe(1);
		expect(planItems[0]!.kind === 'plan' && planItems[0]!.entries.length).toBe(1);
	});

	it('repeated plan_updated within one turn updates the same card in place', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		const ctrl = ctx.mockClients[0]!.mockController;
		ctrl.emit({
			type: 'plan_updated',
			sessionId: SID,
			entries: [{ content: 'a', status: 'pending', priority: 'high' }],
		});
		ctrl.emit({
			type: 'plan_updated',
			sessionId: SID,
			entries: [
				{ content: 'a', status: 'completed', priority: 'high' },
				{ content: 'b', status: 'pending', priority: 'medium' },
			],
		});
		const planItems = ctx.store.getState().timeline.filter((i) => i.kind === 'plan');
		expect(planItems.length).toBe(1);
		const plan = planItems[0]!;
		expect(plan.kind === 'plan' && plan.entries.length).toBe(2);
		expect(plan.kind === 'plan' && plan.entries[0]!.status).toBe('completed');
	});

	it('plan_updated after prompt_finished spawns a fresh plan card', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		const ctrl = ctx.mockClients[0]!.mockController;
		ctrl.emit({
			type: 'plan_updated',
			sessionId: SID,
			entries: [{ content: 'a', status: 'pending', priority: 'high' }],
		});
		ctrl.emit({ type: 'prompt_finished', stopReason: 'end_turn' });
		ctrl.emit({
			type: 'plan_updated',
			sessionId: SID,
			entries: [{ content: 'b', status: 'pending', priority: 'high' }],
		});
		const planItems = ctx.store.getState().timeline.filter((i) => i.kind === 'plan');
		expect(planItems.length).toBe(2);
	});

	it('tool_call + tool_call_update collapse to one item with merged status', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		const ctrl = ctx.mockClients[0]!.mockController;
		ctrl.emit({ type: 'tool_call_updated', sessionId: SID, toolCallId: 't1', title: 'T1', status: 'pending' });
		ctrl.emit({ type: 'tool_call_updated', sessionId: SID, toolCallId: 't1', title: 'T1', status: 'completed' });
		ctrl.emit({ type: 'tool_call_updated', sessionId: SID, toolCallId: 't2', title: 'T2' });
		const tools = ctx.store.getState().timeline.filter((i) => i.kind === 'tool');
		expect(tools.length).toBe(2);
		expect(tools[0]!.kind === 'tool' && tools[0]!.status).toBe('completed');
		expect(tools[1]!.kind === 'tool' && tools[1]!.toolCallId).toBe('t2');
	});

	it('interleaved tool_call and message_chunk preserve event order in timeline', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: SID }));
		const ctrl = ctx.mockClients[0]!.mockController;
		ctrl.emit({ type: 'message_chunk', sessionId: SID, role: 'agent', text: 'thinking ' });
		ctrl.emit({ type: 'tool_call_updated', sessionId: SID, toolCallId: 't1', title: 'Read', status: 'pending' });
		ctrl.emit({ type: 'message_chunk', sessionId: SID, role: 'agent', text: 'done.' });
		const kinds = ctx.store.getState().timeline.map((i) => i.kind);
		expect(kinds).toEqual(['text', 'tool', 'text']);
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

	it('exportProtocol on empty log appends a system note and skips file write', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		await ctx.store.getState().exportProtocol();
		const sysMessages = ctx.store
			.getState()
			.timeline.filter((i) => i.kind === 'text' && i.role === 'system')
			.map((i) => (i as { text: string }).text);
		expect(sysMessages.some((t) => t.includes('empty'))).toBe(true);
	});

	it('logStateToConsole does not throw on a fresh store', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().logStateToConsole();
		// 没抛异常即视为通过；具体内容已在 createLogger 通道里走 UE_LOG。
		expect(true).toBe(true);
	});
});
