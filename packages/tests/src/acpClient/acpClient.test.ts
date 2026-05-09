import { describe, it, expect, beforeEach } from '../testRunner';
import { ACPClient, type AcpTransportFactory, buildSpawnArgs } from '@universe-agent/acp-client-ue';
import type { CliOptions } from '../../../acp-client-ue/src/cli';
import { TestRenderer } from './__fixtures__/testRenderer';
import { createTransportPair, InMemoryNdJsonTransport } from './__fixtures__/inMemoryNdJsonTransport';
import { MockAcpServer } from './__fixtures__/mockAcpServer';
import { withTimeout } from './__fixtures__/withTimeout';

function defaultOptions(overrides: Partial<CliOptions> = {}): CliOptions {
	return {
		command: 'fake-acp',
		args: [],
		workspace: '/workspace',
		protocol: false,
		verbose: false,
		permission: 'auto-approve',
		mode: undefined,
		session: undefined,
		model: undefined,
		apiKey: undefined,
		baseUrl: undefined,
		...overrides,
	};
}

interface Harness {
	client: ACPClient;
	server: MockAcpServer;
	renderer: TestRenderer;
	clientTransport: InMemoryNdJsonTransport;
	serverTransport: InMemoryNdJsonTransport;
}

function buildHarness(options: CliOptions = defaultOptions()): Harness {
	const { client: clientTransport, server: serverTransport } = createTransportPair();
	const renderer = new TestRenderer();
	const transportFactory: AcpTransportFactory = () => clientTransport;
	const client = new ACPClient(renderer as any, options, transportFactory);
	const server = new MockAcpServer(serverTransport);
	return { client, server, renderer, clientTransport, serverTransport };
}

describe('buildSpawnArgs (pure)', () => {
	it('wraps command with cmd /c and appends --workspace', () => {
		const r = buildSpawnArgs(defaultOptions({ command: 'npx universe-agent-acp', workspace: '/proj' }));
		expect(r.executable).toBe('cmd');
		expect(r.args).toBe('/c npx universe-agent-acp --workspace /proj');
		expect(r.workspace).toBe('/proj');
	});

	it('joins extra args after workspace', () => {
		const r = buildSpawnArgs(defaultOptions({ command: 'foo', workspace: '/w', args: ['--model', 'gpt-4'] }));
		expect(r.args).toBe('/c foo --workspace /w --model gpt-4');
	});
});

describe('ACPClient - initialize', () => {
	it('sends initialize with protocolVersion + clientCapabilities', async () => {
		const h = buildHarness();
		h.server.respondTo('initialize', () => ({
			protocolVersion: 1,
			agentInfo: { name: 'mock', version: '0.1' },
			agentCapabilities: { promptCapabilities: { audio: false, image: false, embeddedContext: false } },
		}));

		await h.client.connect();
		const result = await withTimeout(h.client.initialize(), 1000, 'initialize');

		expect(result.agentInfo?.name).toBe('mock');
		const params = h.server.lastRequestParams('initialize') as any;
		expect(typeof params.protocolVersion).toBe('number');
		expect(params.clientCapabilities.fs.readTextFile).toBe(true);
		expect(params.clientCapabilities.fs.writeTextFile).toBe(true);
		expect(params.clientCapabilities.terminal).toBe(true);
		expect(params.clientInfo.name).toBe('universe-agent-acp-client');
	});
});

describe('ACPClient - newSession with mcpServers', () => {
	let h: Harness;
	beforeEach(() => {
		h = buildHarness();
		h.server.respondTo('session/new', () => ({
			sessionId: 'sess-A',
			configOptions: [{ id: 'verbose', name: 'V', type: 'boolean', currentValue: false }],
			modes: { currentModeId: 'fast', availableModes: [{ id: 'fast' }] },
		}));
	});

	it('transmits mcpServers args/env arrays as-is', async () => {
		await h.client.connect();
		h.client.setMcpServers([
			{ name: 'ue-editor', command: 'node', args: ['/path/main.js', '--pipe', 'p'], env: [] },
			{ name: 'no-args', command: 'foo', args: [], env: [] },
		]);
		await withTimeout(h.client.newSession(), 1000, 'newSession');

		const params = h.server.lastRequestParams('session/new') as any;
		expect(params.cwd).toBe('/workspace');
		expect(Array.isArray(params.mcpServers)).toBe(true);
		expect(params.mcpServers.length).toBe(2);
		expect(params.mcpServers[0].args).toEqual(['/path/main.js', '--pipe', 'p']);
		expect(params.mcpServers[0].env).toEqual([]);
		expect(params.mcpServers[1].args).toEqual([]);
		expect(params.mcpServers[1].env).toEqual([]);
	});

	it('applies sessionId / configOptions / modes from response', async () => {
		await h.client.connect();
		await withTimeout(h.client.newSession(), 1000);

		expect(h.client.sessionId).toBe('sess-A');
		expect(h.client.configOptions.length).toBe(1);
		expect(h.client.modes?.currentModeId).toBe('fast');
		expect(h.client.sessionInfo?.sessionId).toBe('sess-A');
	});

	it('passes sessionId to loadSession', async () => {
		await h.client.connect();
		h.server.respondTo('session/load', () => ({ sessionId: 'sess-loaded' }));
		await withTimeout(h.client.loadSession('preexisting-id'), 1000);

		const params = h.server.lastRequestParams('session/load') as any;
		expect(params.sessionId).toBe('preexisting-id');
		expect(params.cwd).toBe('/workspace');
		expect(h.client.sessionId).toBe('sess-loaded');
	});
});

describe('ACPClient - prompt / cancel', () => {
	it('prompt sends sessionId + text content and returns stopReason', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 'sess-P' }));
		h.server.respondTo('session/prompt', () => ({ stopReason: 'end_turn' }));

		await h.client.connect();
		await withTimeout(h.client.newSession(), 1000);
		const result = await withTimeout(h.client.prompt('hello'), 1000);

		expect(result.stopReason).toBe('end_turn');
		const params = h.server.lastRequestParams('session/prompt') as any;
		expect(params.sessionId).toBe('sess-P');
		expect(params.prompt).toEqual([{ type: 'text', text: 'hello' }]);
	});

	it('prompt without active session throws', async () => {
		const h = buildHarness();
		await h.client.connect();
		let caught: any;
		try {
			await h.client.prompt('hi');
		} catch (e) {
			caught = e;
		}
		expect(caught instanceof Error).toBe(true);
	});

	it('cancel emits notification (no response wait)', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 'sess-X' }));
		await h.client.connect();
		await withTimeout(h.client.newSession(), 1000);

		await h.client.cancel();
		// notification 是同步发出的，立即检查
		const ntfs = h.server.getReceivedNotifications();
		const cancel = ntfs.find((n) => n.method === 'session/cancel');
		expect(cancel).toBeTruthy();
		expect((cancel!.params as any).sessionId).toBe('sess-X');
	});

	it('cancel without session is no-op', async () => {
		const h = buildHarness();
		await h.client.connect();
		await h.client.cancel(); // 不应抛错
	});
});

describe('ACPClient - setConfigOption', () => {
	it('setMode sends params.modeId', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 'sess-M' }));
		h.server.respondTo('session/set_mode', () => ({}));

		await h.client.connect();
		await withTimeout(h.client.newSession(), 1000);
		await withTimeout(h.client.setMode('bypassPermissions'), 1000);

		const params = h.server.lastRequestParams('session/set_mode') as any;
		expect(params.sessionId).toBe('sess-M');
		expect(params.modeId).toBe('bypassPermissions');
		expect('mode' in params).toBe(false);
	});

	it('boolean valueId sends params.value', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 'sess-C' }));
		h.server.respondTo('session/set_config_option', () => ({
			configOptions: [{ id: 'verbose', name: 'V', type: 'boolean', currentValue: true }],
		}));

		await h.client.connect();
		await withTimeout(h.client.newSession(), 1000);
		const cfg = await withTimeout(h.client.setConfigOption('verbose', true), 1000);

		const params = h.server.lastRequestParams('session/set_config_option') as any;
		expect(params.configId).toBe('verbose');
		expect(params.value).toBe(true);
		expect('valueId' in params).toBe(false);
		expect(cfg.length).toBe(1);
	});

	it('string value sends params.value', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 'sess-C2' }));
		h.server.respondTo('session/set_config_option', () => ({}));

		await h.client.connect();
		await withTimeout(h.client.newSession(), 1000);
		await withTimeout(h.client.setConfigOption('mode', 'fast'), 1000);

		const params = h.server.lastRequestParams('session/set_config_option') as any;
		expect(params.configId).toBe('mode');
		expect(params.value).toBe('fast');
		expect('valueId' in params).toBe(false);
	});
});

describe('ACPClient - disconnect', () => {
	it('disconnect clears state and is idempotent', async () => {
		const h = buildHarness();
		h.server.respondTo('session/new', () => ({ sessionId: 'sess-D' }));
		await h.client.connect();
		await withTimeout(h.client.newSession(), 1000);

		await h.client.disconnect();
		expect(h.client.sessionId).toBeNull();
		expect(h.client.configOptions.length).toBe(0);
		// 第二次 disconnect 不应抛
		await h.client.disconnect();
	});
});

describe('ACPClient - protocol observer wiring', () => {
	it('renderer.renderProtocolMessage receives both directions', async () => {
		const h = buildHarness();
		h.server.respondTo('initialize', () => ({
			protocolVersion: 1,
			agentInfo: { name: 'm', version: '0' },
			agentCapabilities: { promptCapabilities: { audio: false, image: false, embeddedContext: false } },
		}));

		await h.client.connect();
		await withTimeout(h.client.initialize(), 1000);

		const sends = h.renderer.protocolMessages.filter((p) => p.direction === 'send');
		const recvs = h.renderer.protocolMessages.filter((p) => p.direction === 'recv');
		expect(sends.length).toBeGreaterThan(0);
		expect(recvs.length).toBeGreaterThan(0);
	});

	it('renderer.renderSessionUpdate receives session/update notifications', async () => {
		const h = buildHarness();
		await h.client.connect();
		// 服务端推一条 session/update
		h.server.notify('session/update', {
			sessionId: 's',
			update: { sessionUpdate: 'plan', entries: [] },
		});
		// 微任务排空
		await new Promise((r) => setTimeout(r, 10));
		expect(h.renderer.sessionUpdates.length).toBe(1);
	});
});
