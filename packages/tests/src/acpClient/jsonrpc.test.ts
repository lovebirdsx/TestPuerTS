import { describe, it, expect } from '../testRunner';
import { JsonRpcConnection } from '@universe-agent/acp-client-ue';
import { createTransportPair } from './__fixtures__/inMemoryNdJsonTransport';
import { withTimeout, flushMicrotasks } from './__fixtures__/withTimeout';

// 注：editor/acp/e2e.test.ts 已覆盖了基本的 request/response/notification/error 路径与多帧粘包；
// 本文件只补充该文件未覆盖的细节：observer / 服务端 handler / 关闭语义 / 不完整行缓冲 / 错误映射。

describe('JsonRpcConnection - observer', () => {
	it('observer receives both directions of messages', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		const sServer = new JsonRpcConnection(server);

		const events: { dir: 'send' | 'recv'; method?: string }[] = [];
		cClient.onMessage((dir, msg) => {
			events.push({ dir, method: (msg as any).method });
		});

		sServer.onRequest(async (method) => {
			if (method === 'foo') return { ok: true };
			throw new Error('no');
		});

		await withTimeout(cClient.sendRequest('foo', { x: 1 }), 1000, 'foo request');

		// 应同时观察到 send (request) 和 recv (response)
		const sends = events.filter((e) => e.dir === 'send');
		const recvs = events.filter((e) => e.dir === 'recv');
		expect(sends.length).toBeGreaterThan(0);
		expect(recvs.length).toBeGreaterThan(0);
		expect(sends[0]!.method).toBe('foo');
	});
});

describe('JsonRpcConnection - server-side request handler', () => {
	it('handler returning value is sent back as result', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		const sServer = new JsonRpcConnection(server);

		sServer.onRequest(async (method, params) => {
			expect(method).toBe('add');
			const p = params as { a: number; b: number };
			return p.a + p.b;
		});

		const result = await withTimeout(cClient.sendRequest<number>('add', { a: 7, b: 5 }), 1000);
		expect(result).toBe(12);
	});

	it('handler with no result returns null in response', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		const sServer = new JsonRpcConnection(server);

		sServer.onRequest(async () => undefined);

		const result = await withTimeout(cClient.sendRequest('void-op'), 1000);
		expect(result).toBeNull();
	});

	it('handler throwing plain Error maps to -32000 with message', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		const sServer = new JsonRpcConnection(server);

		sServer.onRequest(async () => {
			throw new Error('plain failure');
		});

		let caught: any;
		try {
			await withTimeout(cClient.sendRequest('boom'), 1000);
		} catch (err) {
			caught = err;
		}
		expect(caught instanceof Error).toBe(true);
		expect(caught.message).toBe('plain failure');
		expect(caught.code).toBe(-32000);
	});

	it('handler throwing object with code preserves the code', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		const sServer = new JsonRpcConnection(server);

		sServer.onRequest(async () => {
			throw { code: -32099, message: 'custom', data: { hint: 'x' } };
		});

		let caught: any;
		try {
			await withTimeout(cClient.sendRequest('coded'), 1000);
		} catch (err) {
			caught = err;
		}
		expect(caught.code).toBe(-32099);
		expect(caught.message).toBe('custom');
		expect(caught.data?.hint).toBe('x');
	});

	it('connection without registered handler responds with -32601', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		// 故意不调 onRequest
		const _sServer = new JsonRpcConnection(server);

		let caught: any;
		try {
			await withTimeout(cClient.sendRequest('whatever'), 1000);
		} catch (err) {
			caught = err;
		}
		expect(caught.code).toBe(-32601);
	});
});

describe('JsonRpcConnection - close semantics', () => {
	it('close after pending request rejects the request with "Connection closed"', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		// 让服务端永远不响应（也不预置 handler），但要先消费消息以避免 -32601 自动响应
		const sServer = new JsonRpcConnection(server);
		sServer.onRequest(() => new Promise(() => {})); // never resolves

		const pending = cClient.sendRequest('hang');
		await flushMicrotasks(); // 让请求送出
		cClient.dispose();

		let caught: any;
		try {
			await withTimeout(pending, 1000);
		} catch (err) {
			caught = err;
		}
		expect(caught instanceof Error).toBe(true);
		expect(caught.message).toBe('Connection closed');
	});

	it('closed promise resolves after dispose', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);
		const _sServer = new JsonRpcConnection(server);

		let resolved = false;
		cClient.closed.then(() => {
			resolved = true;
		});
		cClient.dispose();
		await flushMicrotasks();
		expect(resolved).toBe(true);
	});
});

describe('JsonRpcConnection - partial-line buffering', () => {
	it('partial chunks are joined across onData calls', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);

		const received: { method: string; params: unknown }[] = [];
		cClient.onNotification((method, params) => {
			received.push({ method, params });
		});

		// server 直接通过底层 transport push 半行 + 半行
		const enc = new TextEncoder();
		const full = JSON.stringify({ jsonrpc: '2.0', method: 'split', params: { a: 1 } }) + '\n';
		const half1 = enc.encode(full.slice(0, 10));
		const half2 = enc.encode(full.slice(10));
		server.send(half1);
		expect(received.length).toBe(0);
		server.send(half2);
		await flushMicrotasks();
		expect(received.length).toBe(1);
		expect(received[0]!.method).toBe('split');
	});

	it('invalid JSON line is logged but does not crash subsequent parsing', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);

		const received: { method: string; params: unknown }[] = [];
		cClient.onNotification((method, params) => {
			received.push({ method, params });
		});

		// 一行垃圾 + 一行有效
		const enc = new TextEncoder();
		server.send(enc.encode('not-json\n'));
		server.send(enc.encode(JSON.stringify({ jsonrpc: '2.0', method: 'after', params: 1 }) + '\n'));
		await flushMicrotasks();
		expect(received.length).toBe(1);
		expect(received[0]!.method).toBe('after');
	});
});

describe('JsonRpcConnection - notifications', () => {
	it('sendNotification has no id and gets no response', async () => {
		const { client, server } = createTransportPair();
		const cClient = new JsonRpcConnection(client);

		const recvBuf: string[] = [];
		const dec = new TextDecoder();
		// 直接拦截 server 端原始 onData，断言收到的帧无 id
		(server as any).onData((data: Uint8Array) => {
			recvBuf.push(dec.decode(data));
		});

		cClient.sendNotification('ping', { x: 1 });
		await flushMicrotasks();
		expect(recvBuf.length).toBe(1);
		const parsed = JSON.parse(recvBuf[0]!.trim());
		expect(parsed.method).toBe('ping');
		expect('id' in parsed).toBe(false);
	});
});
