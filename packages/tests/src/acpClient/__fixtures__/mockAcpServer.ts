import { type JsonRpcMessage, type JsonRpcRequest, type JsonRpcNotification } from '@universe-agent/acp-client-ue';
import { InMemoryNdJsonTransport } from './inMemoryNdJsonTransport';
import { encodeUtf8, Utf8StreamDecoder } from '@universe-agent/editor-common';

/**
 * 测试侧的"假 ACP server"：直接读写 ndjson 字符串，不再起第二个 JsonRpcConnection。
 * 用于断言客户端发出的帧、并发送预置的响应/通知。
 */
export class MockAcpServer {
	private transport: InMemoryNdJsonTransport;
	private buffer = '';
	private decoder = new Utf8StreamDecoder();
	private receivedRequests: JsonRpcRequest[] = [];
	private receivedNotifications: JsonRpcNotification[] = [];
	/** 按方法名预置请求处理器：返回 result 或抛出 { code, message } */
	private requestResponders = new Map<string, (params: any) => unknown | Promise<unknown>>();
	private waitResolvers: { method: string; resolve: (req: JsonRpcRequest) => void }[] = [];

	constructor(transport: InMemoryNdJsonTransport) {
		this.transport = transport;
		transport.onData((data) => this.onRawData(data));
	}

	/** 预置请求处理：客户端发 method 请求时自动回应。 */
	respondTo(method: string, responder: (params: any) => unknown | Promise<unknown>): void {
		this.requestResponders.set(method, responder);
	}

	/** 主动向客户端推通知。 */
	notify(method: string, params?: unknown): void {
		const msg: JsonRpcNotification = { jsonrpc: '2.0', method, params };
		this.send(msg);
	}

	/** 主动向客户端推任意原始 JSON 字符串（用于错误格式测试） — 经 transport 真正送给 client。 */
	pushRaw(line: string): void {
		const text = line.endsWith('\n') ? line : line + '\n';
		this.transport.send(encodeUtf8(text));
	}

	/** 等待客户端发起指定方法的请求，超时则 reject。 */
	waitForRequest(method: string, timeoutMs = 1000): Promise<JsonRpcRequest> {
		const existing = this.receivedRequests.find((r) => r.method === method);
		if (existing) return Promise.resolve(existing);
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				const idx = this.waitResolvers.findIndex((w) => w.resolve === resolve);
				if (idx >= 0) this.waitResolvers.splice(idx, 1);
				reject(new Error(`Timeout waiting for request: ${method}`));
			}, timeoutMs);
			this.waitResolvers.push({
				method,
				resolve: (req) => {
					clearTimeout(timer);
					resolve(req);
				},
			});
		});
	}

	getReceivedRequests(): JsonRpcRequest[] {
		return [...this.receivedRequests];
	}

	getReceivedNotifications(): JsonRpcNotification[] {
		return [...this.receivedNotifications];
	}

	lastRequestParams(method: string): unknown {
		const matched = this.receivedRequests.filter((r) => r.method === method);
		return matched.length > 0 ? matched[matched.length - 1]!.params : undefined;
	}

	private onRawData(data: Uint8Array): void {
		this.buffer += this.decoder.decode(data);
		const lines = this.buffer.split('\n');
		this.buffer = lines.pop() ?? '';
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			let msg: JsonRpcMessage;
			try {
				msg = JSON.parse(trimmed) as JsonRpcMessage;
			} catch {
				continue;
			}
			if ('id' in msg && msg.id !== undefined && msg.id !== null && 'method' in msg) {
				const req = msg as JsonRpcRequest;
				this.receivedRequests.push(req);
				const idx = this.waitResolvers.findIndex((w) => w.method === req.method);
				if (idx >= 0) {
					const w = this.waitResolvers.splice(idx, 1)[0]!;
					w.resolve(req);
				}
				this.handleRequest(req);
			} else if ('method' in msg) {
				this.receivedNotifications.push(msg as JsonRpcNotification);
			}
		}
	}

	private handleRequest(req: JsonRpcRequest): void {
		const responder = this.requestResponders.get(req.method);
		if (!responder) {
			this.send({
				jsonrpc: '2.0',
				id: req.id,
				error: { code: -32601, message: `Method not found: ${req.method}` },
			});
			return;
		}
		Promise.resolve()
			.then(() => responder(req.params))
			.then((result) => {
				this.send({ jsonrpc: '2.0', id: req.id, result: result ?? null });
			})
			.catch((err: any) => {
				const error =
					err && typeof err === 'object' && 'code' in err
						? { code: err.code, message: err.message, data: err.data }
						: { code: -32000, message: err instanceof Error ? err.message : String(err) };
				this.send({ jsonrpc: '2.0', id: req.id, error });
			});
	}

	private send(msg: JsonRpcMessage): void {
		const line = JSON.stringify(msg) + '\n';
		this.transport.send(encodeUtf8(line));
	}
}
