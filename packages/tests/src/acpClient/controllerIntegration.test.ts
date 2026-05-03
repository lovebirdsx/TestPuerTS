import { describe, it, expect } from '../testRunner';
import { AcpUiController, type AcpTransportFactory, type AcpUiEvent } from '@universe-agent/acp-client-ue';
import { createTransportPair } from './__fixtures__/inMemoryNdJsonTransport';
import { MockAcpServer } from './__fixtures__/mockAcpServer';
import { withTimeout, flushMicrotasks } from './__fixtures__/withTimeout';

interface Harness {
	controller: AcpUiController;
	server: MockAcpServer;
	events: AcpUiEvent[];
	unsubscribe: () => void;
}

function buildHarness(initialMcpServers: { name: string; command: string }[] = []): Harness {
	const { client: clientTransport, server: serverTransport } = createTransportPair();
	const factory: AcpTransportFactory = () => clientTransport;
	const server = new MockAcpServer(serverTransport);

	// 默认 initialize / session/new 应答（多数测试需要）
	server.respondTo('initialize', () => ({
		protocolVersion: 1,
		agentInfo: { name: 'mock-agent', version: '0.1' },
		agentCapabilities: {},
	}));

	const controller = new AcpUiController(
		{
			command: 'fake-acp',
			args: [],
			workspace: '/workspace',
			permission: 'auto-approve',
			mcpServers: initialMcpServers,
			protocol: true,
		},
		factory,
	);

	const events: AcpUiEvent[] = [];
	const unsubscribe = controller.subscribe((e) => events.push(e));
	return { controller, server, events, unsubscribe };
}

describe('AcpUiController - lifecycle wiring', () => {
	it('connect emits initialized + status_changed(connected)', async () => {
		const h = buildHarness();
		await withTimeout(h.controller.connect(), 2000, 'connect');

		const initialized = h.events.find((e) => e.type === 'initialized');
		const connected = h.events.find((e) => e.type === 'status_changed' && e.status === 'connected');
		expect(initialized).toBeTruthy();
		expect(connected).toBeTruthy();

		const state = h.controller.getState();
		expect(state.status).toBe('connected');
		expect(state.agentName).toBe('mock-agent');

		h.unsubscribe();
		await h.controller.disconnect();
	});

	it('newSession injects mcpServers from setMcpServers into ACP request', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 'sess-CTL' }));

		h.controller.setMcpServers([{ name: 'inj', command: 'node' }]);

		await withTimeout(h.controller.connect(), 2000);
		await withTimeout(h.controller.newSession(), 2000);

		const params = h.server.lastRequestParams('session/new') as any;
		expect(params.cwd).toBe('/workspace');
		expect(params.mcpServers.length).toBe(1);
		expect(params.mcpServers[0].name).toBe('inj');
		// normalizeMcpServers 补 args=[] env=[]
		expect(params.mcpServers[0].args).toEqual([]);
		expect(params.mcpServers[0].env).toEqual([]);

		const sessionChanged = h.events.find((e) => e.type === 'session_changed');
		expect(sessionChanged).toBeTruthy();
		expect(h.controller.getState().sessionId).toBe('sess-CTL');

		h.unsubscribe();
		await h.controller.disconnect();
	});

	it('setMcpServers before connect: initial entry is honored at session/new', async () => {
		const h = buildHarness([{ name: 'pre', command: 'node' }]);
		h.server.respondTo('session/new', () => ({ sessionId: 's' }));

		await withTimeout(h.controller.connect(), 2000);
		await withTimeout(h.controller.newSession(), 2000);

		const params = h.server.lastRequestParams('session/new') as any;
		expect(params.mcpServers[0].name).toBe('pre');

		h.unsubscribe();
		await h.controller.disconnect();
	});

	it('protocol_message events fire when protocol enabled', async () => {
		const h = buildHarness();
		await withTimeout(h.controller.connect(), 2000);

		const proto = h.events.filter((e) => e.type === 'protocol_message');
		// 至少有 send(initialize) 和 recv(initialize response)
		expect(proto.length).toBeGreaterThan(0);
		const sends = proto.filter((e) => e.type === 'protocol_message' && e.direction === 'send');
		const recvs = proto.filter((e) => e.type === 'protocol_message' && e.direction === 'recv');
		expect(sends.length).toBeGreaterThan(0);
		expect(recvs.length).toBeGreaterThan(0);

		h.unsubscribe();
		await h.controller.disconnect();
	});

	it('disconnect resets state and emits status_changed(disconnected)', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 's-D' }));
		await withTimeout(h.controller.connect(), 2000);
		await withTimeout(h.controller.newSession(), 2000);

		await h.controller.disconnect();
		const state = h.controller.getState();
		expect(state.status).toBe('disconnected');
		expect(state.sessionId).toBeNull();

		const last = h.events[h.events.length - 1];
		expect(last?.type).toBe('status_changed');
		if (last?.type === 'status_changed') expect(last.status).toBe('disconnected');

		h.unsubscribe();
	});
});

describe('AcpUiController - permission strategy', () => {
	it('auto-approve resolves permission requests automatically', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 's-P' }));
		await withTimeout(h.controller.connect(), 2000);
		await withTimeout(h.controller.newSession(), 2000);

		// 服务端主动发起 session/request_permission（mock 注入），客户端应用 auto-approve 立即回复
		h.server.pushRaw(
			JSON.stringify({
				jsonrpc: '2.0',
				id: 9999,
				method: 'session/request_permission',
				params: {
					toolCall: { toolCallId: 'tc1', title: 'do-thing' },
					options: [
						{ optionId: 'allow_once', name: 'A', kind: 'allow_once' },
						{ optionId: 'reject_once', name: 'R', kind: 'reject_once' },
					],
				},
			}),
		);

		// 让微任务排空（处理 → 回复）
		await flushMicrotasks(10);

		// 通过 protocol_message 事件验证客户端回了 id=9999 的 response
		const sentMessages = h.events.filter(
			(e): e is Extract<AcpUiEvent, { type: 'protocol_message' }> =>
				e.type === 'protocol_message' && e.direction === 'send',
		);
		const response = sentMessages.find((e) => {
			const msg = e.message as any;
			return msg.id === 9999 && msg.result !== undefined;
		});
		expect(response).toBeTruthy();
		if (response) {
			const result = (response.message as any).result;
			expect(result.outcome.outcome).toBe('selected');
			expect(result.outcome.optionId).toBe('allow_once');
		}

		h.unsubscribe();
		await h.controller.disconnect();
	});
});
