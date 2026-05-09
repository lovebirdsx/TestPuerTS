import { describe, expect, it } from '../testRunner';
import { createTestStore, flushMicrotasks, waitHydration } from './testStore';
import type { TextItem } from 'editor';

describe('AcpPanel store / prompt', () => {
	it('sendPrompt trims, requires connected client, and pushes user message', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.getState().setPrompt('  hello world  ');
		ctx.store.getState().sendPrompt();
		await flushMicrotasks();

		const s = ctx.store.getState();
		expect(s.prompt).toBe('');
		expect(s.isPrompting).toBe(true);
		expect(ctx.mockClients[0]!.mockController.sendPromptCalls).toEqual(['hello world']);
		expect(s.timeline.some((i) => i.kind === 'text' && i.role === 'user' && i.text === 'hello world')).toBe(true);
	});

	it('sendPrompt with empty text is a no-op', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.getState().setPrompt('   ');
		ctx.store.getState().sendPrompt();
		expect(ctx.store.getState().isPrompting).toBe(false);
		expect(ctx.mockClients[0]!.mockController.sendPromptCalls.length).toBe(0);
	});

	it('cancel resets isPrompting and pushes system message', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, isPrompting: true }));

		ctx.store.getState().cancel();
		expect(ctx.store.getState().isPrompting).toBe(false);
		expect(ctx.mockClients[0]!.mockController.cancelCalls).toBe(1);
	});

	it('prompt_finished event resets isPrompting', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, isPrompting: true }));
		ctx.mockClients[0]!.mockController.emit({ type: 'prompt_finished', stopReason: 'end_turn' });
		const s = ctx.store.getState();
		expect(s.isPrompting).toBe(false);
		expect(s.timeline.some((i) => i.kind === 'text' && i.text.includes('end_turn'))).toBe(true);
	});
});

describe('AcpPanel store / conversation', () => {
	it('appendStream collapses consecutive same-role chunks', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: 'sid' }));

		const ctrl = ctx.mockClients[0]!.mockController;
		ctrl.emit({ type: 'message_chunk', sessionId: 'sid', role: 'agent', text: 'Hello' });
		ctrl.emit({ type: 'message_chunk', sessionId: 'sid', role: 'agent', text: ' world' });
		ctrl.emit({ type: 'thought_chunk', sessionId: 'sid', text: 'thinking' });
		ctrl.emit({ type: 'message_chunk', sessionId: 'sid', role: 'agent', text: '!' });

		const textItems = ctx.store.getState().timeline.filter((i): i is TextItem => i.kind === 'text');
		expect(textItems.length).toBe(3);
		expect(textItems[0]!.role).toBe('agent');
		expect(textItems[0]!.text).toBe('Hello world');
		expect(textItems[1]!.role).toBe('thought');
		expect(textItems[2]!.role).toBe('agent');
		expect(textItems[2]!.text).toBe('!');
	});

	it('clearMessages empties timeline', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: 'sid' }));
		ctx.mockClients[0]!.mockController.emit({ type: 'message_chunk', sessionId: 'sid', role: 'agent', text: 'x' });
		expect(ctx.store.getState().timeline.length).toBe(1);

		ctx.store.getState().clearMessages();
		expect(ctx.store.getState().timeline.length).toBe(0);
	});
});
