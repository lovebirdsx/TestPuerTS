import * as UE from 'ue';
import { z } from 'zod';
import { Client } from '@modelcontextprotocol/sdk/dist/cjs/client/index';
import { BridgeTransport, McpServer, registerBuiltinTools, type BridgeLink } from '@universe-agent/mcp-server-ue';
import { describe, it, expect, beforeAll, afterAll } from '../testRunner';
import { createLinkedBridgeLinks } from './inMemoryBridgeLink';

interface Harness {
	server: McpServer;
	client: Client;
	dispose: () => Promise<void>;
}

async function buildHarness(extra?: (s: McpServer) => void): Promise<Harness> {
	const [clientLink, serverLink] = createLinkedBridgeLinks();
	const server = new McpServer({ name: 'ue-editor-test', version: '0.0.1' });
	registerBuiltinTools(server);
	extra?.(server);

	const client = new Client({ name: 'test-client', version: '0.0.1' });

	// connect 顺序：先把 server transport 准备好（传入 link），再 client connect 触发 initialize
	const serverTransport = new BridgeTransport(serverLink as BridgeLink);
	const clientTransport = new BridgeTransport(clientLink as BridgeLink);

	// server.connect 内部会 await transport.start() 并注册 onmessage
	await server.connect(serverTransport);
	await client.connect(clientTransport);

	return {
		server,
		client,
		async dispose() {
			try {
				await client.close();
			} catch {
				// ignore
			}
			try {
				await server.close();
			} catch {
				// ignore
			}
		},
	};
}

describe('mcp-server-ue - tool listing', () => {
	let harness: Harness;

	beforeAll(async () => {
		harness = await buildHarness();
	});

	afterAll(async () => {
		await harness.dispose();
	});

	it('lists the three builtin tools', async () => {
		const res = await harness.client.listTools();
		const names = res.tools.map((t) => t.name).sort();
		expect(names).toEqual(['echo', 'get_project_info', 'list_assets']);
	});

	it('echo tool advertises a string `message` argument', async () => {
		const res = await harness.client.listTools();
		const echo = res.tools.find((t) => t.name === 'echo');
		expect(echo).toBeTruthy();
		const props = echo!.inputSchema.properties as Record<string, { type?: string }> | undefined;
		expect(props).toBeTruthy();
		expect(props!.message?.type).toBe('string');
	});
});

describe('mcp-server-ue - echo tool', () => {
	let harness: Harness;

	beforeAll(async () => {
		harness = await buildHarness();
	});

	afterAll(async () => {
		await harness.dispose();
	});

	it('echoes the supplied message', async () => {
		const res = await harness.client.callTool({
			name: 'echo',
			arguments: { message: 'ping-from-test' },
		});
		const content = res.content as { type: string; text?: string }[];
		expect(content.length).toBe(1);
		expect(content[0].type).toBe('text');
		expect(content[0].text).toBe('ping-from-test');
		expect(res.isError).toBeFalsy();
	});

	it('rejects when required `message` argument is missing', async () => {
		const res = await harness.client.callTool({ name: 'echo', arguments: {} });
		expect(res.isError).toBe(true);
		const content = res.content as { type: string; text?: string }[];
		expect(content.length).toBeGreaterThan(0);
		expect(content[0].type).toBe('text');
		// zod 校验失败信息会出现在 text 中，至少应该提到字段名 message
		expect((content[0].text ?? '').toLowerCase()).toContain('message');
	});
});

describe('mcp-server-ue - get_project_info tool', () => {
	let harness: Harness;

	beforeAll(async () => {
		harness = await buildHarness();
	});

	afterAll(async () => {
		await harness.dispose();
	});

	it('returns the active project directory in JSON form', async () => {
		const res = await harness.client.callTool({ name: 'get_project_info' });
		const content = res.content as { type: string; text?: string }[];
		expect(content.length).toBe(1);
		expect(content[0].type).toBe('text');
		const parsed = JSON.parse(content[0].text ?? '{}');
		expect(typeof parsed.projectDir).toBe('string');
		// 与 UE.JsRunHelper.GetProjectDir() 同源，必然非空
		const expected = UE.JsRunHelper.GetProjectDir();
		expect(parsed.projectDir).toBe(expected);
		expect(parsed.engineVersion).toBe('UE5');
		expect(res.isError).toBeFalsy();
	});
});

describe('mcp-server-ue - list_assets tool', () => {
	let harness: Harness;

	beforeAll(async () => {
		harness = await buildHarness();
	});

	afterAll(async () => {
		await harness.dispose();
	});

	// 注意：list_assets 在 commandlet 环境会触发 C++ 层 access violation（subsystem collection 未初始化），
	// 因此这里只断言 tool 已注册，而不实际 callTool。完整调用需要在编辑器进程中验证。
	it('appears in listTools with optional path/recursive arguments', async () => {
		const res = await harness.client.listTools();
		const la = res.tools.find((t) => t.name === 'list_assets');
		expect(la).toBeTruthy();
		const props = la!.inputSchema.properties as Record<string, { type?: string }> | undefined;
		expect(props).toBeTruthy();
		expect(props!.path?.type).toBe('string');
		expect(props!.recursive?.type).toBe('boolean');
	});

	it.skip('callTool list_assets — needs full editor (subsystem collection unavailable in commandlet)');
});

describe('mcp-server-ue - extra tools extension point', () => {
	let harness: Harness;

	beforeAll(async () => {
		harness = await buildHarness((server) => {
			server.registerTool(
				'add',
				{
					description: 'sum two numbers',
					inputSchema: { a: z.number(), b: z.number() },
				},
				({ a, b }) => ({
					content: [{ type: 'text', text: String(a + b) }],
				}),
			);
		});
	});

	afterAll(async () => {
		await harness.dispose();
	});

	it('extra tools appear in listTools alongside builtins', async () => {
		const res = await harness.client.listTools();
		const names = res.tools.map((t) => t.name);
		expect(names).toContain('add');
		expect(names).toContain('echo');
	});

	it('extra tool round-trips through the bridge', async () => {
		const res = await harness.client.callTool({
			name: 'add',
			arguments: { a: 17, b: 25 },
		});
		const content = res.content as { type: string; text?: string }[];
		expect(content[0].text).toBe('42');
	});
});

describe('mcp-server-ue - error surface', () => {
	let harness: Harness;

	beforeAll(async () => {
		harness = await buildHarness();
	});

	afterAll(async () => {
		await harness.dispose();
	});

	it('unknown tool name yields an error result', async () => {
		const res = await harness.client.callTool({ name: 'no-such-tool' });
		expect(res.isError).toBe(true);
		const content = res.content as { type: string; text?: string }[];
		expect(content.length).toBeGreaterThan(0);
		expect((content[0].text ?? '').toLowerCase()).toContain('no-such-tool');
	});
});
