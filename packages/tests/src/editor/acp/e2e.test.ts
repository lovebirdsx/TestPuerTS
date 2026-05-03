import { describe, it, expect } from '../../testRunner';
import { JsonRpcConnection, type NdJsonTransport, type JsonRpcMessage } from '@universe-agent/acp-client-ue';

// 内存双向 ndjson transport：构造一对相互连接的 transport，模拟 client/server 链路。
// 这样可以把真 JsonRpcConnection 跑在测试里，验证编码/解码、请求/响应/通知的端到端路径。
function createTransportPair(): { a: NdJsonTransport; b: NdJsonTransport } {
	const aData: ((d: Uint8Array) => void)[] = [];
	const bData: ((d: Uint8Array) => void)[] = [];
	const aClose: (() => void)[] = [];
	const bClose: (() => void)[] = [];

	const a: NdJsonTransport = {
		send(d) {
			for (const cb of bData) cb(d);
		},
		onData(cb) {
			aData.push(cb);
		},
		onClose(cb) {
			aClose.push(cb);
		},
		close() {
			for (const cb of aClose) cb();
		},
	};
	const b: NdJsonTransport = {
		send(d) {
			for (const cb of aData) cb(d);
		},
		onData(cb) {
			bData.push(cb);
		},
		onClose(cb) {
			bClose.push(cb);
		},
		close() {
			for (const cb of bClose) cb();
		},
	};
	return { a, b };
}

describe('ACP JSON-RPC end-to-end via in-memory transport', () => {
	it('initialize request from client receives server response', async () => {
		const { a, b } = createTransportPair();
		const client = new JsonRpcConnection(a);
		const server = new JsonRpcConnection(b);

		server.onRequest(async (method, _params) => {
			if (method === 'initialize') {
				return {
					protocolVersion: 1,
					agentInfo: { name: 'mock-agent', version: '0.1.0' },
					agentCapabilities: { promptCapabilities: { audio: false, image: false, embeddedContext: false } },
				};
			}
			throw new Error(`unexpected method ${method}`);
		});

		const result = await client.sendRequest<{ agentInfo: { name: string; version: string } }>('initialize', {});
		expect(result.agentInfo.name).toBe('mock-agent');
		expect(result.agentInfo.version).toBe('0.1.0');
	});

	it('server-side notification reaches client notification handler', async () => {
		const { a, b } = createTransportPair();
		const client = new JsonRpcConnection(a);
		const server = new JsonRpcConnection(b);

		const received: { method: string; params: unknown }[] = [];
		client.onNotification((method, params) => {
			received.push({ method, params });
		});

		server.sendNotification('session/update', { sessionId: 's1', update: { sessionUpdate: 'plan', entries: [] } });

		// 同步 transport 已经把数据派发了，但 dispatch 走的是 onData 的同步回调，不需要等待
		expect(received.length).toBe(1);
		expect(received[0]!.method).toBe('session/update');
	});

	it('multi-line buffered ndjson is decoded into separate messages', async () => {
		const { a, b } = createTransportPair();
		const client = new JsonRpcConnection(a);
		const _server = new JsonRpcConnection(b);

		const received: JsonRpcMessage[] = [];
		client.onNotification((method, params) => {
			received.push({ jsonrpc: '2.0', method, params } as JsonRpcMessage);
		});

		// 直接通过 transport.send 注入多条粘连的 ndjson
		const blob =
			JSON.stringify({ jsonrpc: '2.0', method: 'a', params: 1 }) +
			'\n' +
			JSON.stringify({ jsonrpc: '2.0', method: 'b', params: 2 }) +
			'\n';
		// 模拟 server 推送（b.send 会调用 a 的 onData 回调）
		b.send(new TextEncoder().encode(blob));

		expect(received.length).toBe(2);
		expect((received[0] as any).method).toBe('a');
		expect((received[1] as any).method).toBe('b');
	});

	it('client request fails with rejected promise when server returns error', async () => {
		const { a, b } = createTransportPair();
		const client = new JsonRpcConnection(a);
		const server = new JsonRpcConnection(b);

		server.onRequest(async () => {
			const err: any = new Error('boom');
			err.code = -32001;
			throw err;
		});

		let caught: unknown;
		try {
			await client.sendRequest('willFail', {});
		} catch (err) {
			caught = err;
		}
		expect(caught instanceof Error).toBe(true);
		expect((caught as Error).message).toBe('boom');
		expect((caught as any).code).toBe(-32001);
	});
});
