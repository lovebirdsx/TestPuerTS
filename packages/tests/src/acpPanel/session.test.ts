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
		expect(s.timeline.some((i) => i.kind === 'text' && i.role === 'system' && i.text.includes('sess-1'))).toBe(
			true,
		);
		// session_changed 应把当前会话登记到 sessions 列表头部
		expect(s.sessions[0]?.sessionId).toBe('sess-1');
	});

	it('newSession resets runtime, surfaces warnings and triggers refresh', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		const mock = ctx.mockClients[0]!;
		mock.newSessionImpl = async () => ({ warnings: ['cfg missing'] });
		mock.mockController.listSessionsImpl = async () => ({
			sessions: [{ sessionId: 'sess-old', title: 'Old', updatedAt: '2026-05-01T00:00:00Z' }],
		});

		// 预先放一些"上一次会话"的脏数据，验证 reset 能清掉
		ctx.store.setState((s) => ({
			...s,
			timeline: [{ kind: 'text', id: 999, role: 'user', text: 'stale' }],
		}));

		ctx.store.getState().newSession();
		await flushMicrotasks();
		await flushMicrotasks();
		await flushMicrotasks();

		const s = ctx.store.getState();
		expect(s.timeline.some((i) => i.kind === 'text' && i.text.includes('cfg missing'))).toBe(true);
		expect(s.timeline.some((i) => i.kind === 'text' && i.text === 'stale')).toBe(false);
		// refresh 应填充 sessions
		expect(s.sessions.some((x) => x.sessionId === 'sess-old')).toBe(true);
	});

	it('switchSession requires non-empty id and forwards to client.loadSession', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		const mock = ctx.mockClients[0]!;
		mock.loadSessionImpl = async (id) => ({ warnings: [`loaded ${id}`] });

		ctx.store.getState().switchSession('   ');
		await flushMicrotasks();
		expect(mock.loadSessionCalls.length).toBe(0);

		ctx.store.getState().switchSession('abc');
		await flushMicrotasks();
		await flushMicrotasks();
		expect(mock.loadSessionCalls).toEqual(['abc']);
		// 乐观写入 sessionId 让后续 session/update 能匹配
		expect(ctx.store.getState().sessionId).toBe('abc');
		expect(ctx.store.getState().timeline.some((i) => i.kind === 'text' && i.text.includes('loaded abc'))).toBe(
			true,
		);
	});

	it('switchSession is a no-op when id matches current sessionId', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		const mock = ctx.mockClients[0]!;

		ctx.store.setState((s) => ({ ...s, sessionId: 'cur' }));
		ctx.store.getState().switchSession('cur');
		await flushMicrotasks();
		expect(mock.loadSessionCalls.length).toBe(0);
	});

	it('refreshSessions populates sessions and clears loading state', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		const mock = ctx.mockClients[0]!;
		mock.mockController.listSessionsImpl = async () => ({
			sessions: [
				{ sessionId: 'a', title: 'A', updatedAt: '2026-05-01T00:00:00Z' },
				{ sessionId: 'b', title: null, updatedAt: '2026-05-02T00:00:00Z' },
			],
		});

		await ctx.store.getState().refreshSessions();

		const s = ctx.store.getState();
		expect(s.sessionsLoading).toBe(false);
		expect(s.sessions.map((x) => x.sessionId)).toEqual(['a', 'b']);
	});

	it('ingestEvent drops session-bound events whose sessionId mismatches active session', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().connect();
		ctx.store.setState((s) => ({ ...s, sessionId: 'current' }));

		// 旧会话的尾随消息应被丢弃
		ctx.mockClients[0]!.mockController.emit({
			type: 'message_chunk',
			sessionId: 'old',
			role: 'agent',
			text: 'leak',
		});
		// 当前会话的消息应保留
		ctx.mockClients[0]!.mockController.emit({
			type: 'message_chunk',
			sessionId: 'current',
			role: 'agent',
			text: 'kept',
		});

		const s = ctx.store.getState();
		expect(s.timeline.some((i) => i.kind === 'text' && i.text === 'leak')).toBe(false);
		expect(s.timeline.some((i) => i.kind === 'text' && i.text === 'kept')).toBe(true);
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
