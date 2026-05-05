/**
 * 复现 & 回归：startUeMcpServer / pipeServer BridgeLink 的消息丢失问题。
 *
 * 问题根因：pipeServer.ts 的 BridgeLink.onMessage() 没有 pending buffer。
 * bridge 接入后会立刻发 MCP initialize 帧，但 mcp.connect() 经过 Promise 链
 * 才会调 link.onMessage(handler)。在此窗口期内收到的帧被 messageHandler?.(line)
 * 静默丢弃，导致 agent 等待 MCP 握手超时（~60 秒）。
 *
 * 修复后，BridgeLink.onMessage 在 handler 注册前将收到的消息入队，注册时立即 flush。
 */
import { Client } from '@modelcontextprotocol/sdk/dist/cjs/client/index';
import { BridgeTransport, McpServer, registerBuiltinTools, type BridgeLink } from '@universe-agent/mcp-server-ue';
import { describe, it, expect } from '../testRunner';
import { withTimeout, flushMicrotasks } from '../acpClient/__fixtures__/withTimeout';
import { createLinkedBridgeLinks } from './inMemoryBridgeLink';

/**
 * 构造一个"延迟注册 onMessage"场景：
 * - 先向 bridge 发消息（模拟 bridge 接入后立即发 MCP initialize）
 * - 再调 link.onMessage(handler) 注册处理器
 * 验证消息不会丢失（有 pending buffer）。
 */
describe('mcp/pipeServer', () => {
	it('messages sent before onMessage registration are not lost', async () => {
		// 用内存双向 link 模拟管道，clientLink 代表 bridge 侧，serverLink 代表 editor 侧
		const [clientLink, serverLink] = createLinkedBridgeLinks();

		const received: string[] = [];

		// 先发消息（模拟 bridge 接入后立即发 MCP 帧，此时 editor 侧 onMessage 未注册）
		clientLink.send('{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}');

		// 延迟注册 onMessage（模拟 Promise 链完成后 mcp.connect → transport.start → onMessage）
		await flushMicrotasks(5);
		serverLink.onMessage((line) => received.push(line));
		await flushMicrotasks(5);

		// 修复后：消息应被 pending buffer 保留并在注册时 flush
		expect(received.length).toBe(1);
		expect(received[0]).toContain('initialize');
	});
});

/**
 * 端到端验证：McpServer + BridgeTransport 的完整握手，
 * 即使 client（bridge 侧）在 server 调 mcp.connect 前就发了 initialize。
 */
describe('mcp/pipeServer', () => {
	it('MCP initialize completes even when client sends before server transport is ready', async () => {
		const [clientLink, serverLink] = createLinkedBridgeLinks();

		const server = new McpServer({ name: 'test-server', version: '0.0.1' });
		registerBuiltinTools(server);

		const client = new Client({ name: 'test-client', version: '0.0.1' });
		const clientTransport = new BridgeTransport(clientLink as BridgeLink);
		const serverTransport = new BridgeTransport(serverLink as BridgeLink);

		// 先让 client 开始 connect（内部会发 initialize 帧），但 server 还没 connect
		const clientConnectPromise = client.connect(clientTransport);

		// 让 client 的 initialize 帧飞出去（但 server 的 messageHandler 还没注册）
		await flushMicrotasks(5);

		// 现在 server 才 connect（等价于 ready() 经 Promise 链延迟调用）
		await server.connect(serverTransport);

		// client 的握手必须在合理时间内完成（不超时）
		await withTimeout(clientConnectPromise, 3000, 'MCP initialize handshake');

		const tools = await withTimeout(client.listTools(), 2000, 'listTools');
		expect(tools.tools.length).toBeGreaterThan(0);

		await client.close().catch(() => undefined);
		await server.close().catch(() => undefined);
	});
});
