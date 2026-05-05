/**
 * JSON-RPC 2.0 over ndjson 实现。
 * 替代 @agentclientprotocol/sdk 的 ClientSideConnection/ndJsonStream，
 * 不依赖 Web Streams API，可在 PuerTS 环境中运行。
 */

import { createLogger } from '@universe-agent/editor-common';

const logger = createLogger('acp-client:jsonrpc');

// --- JSON-RPC 消息类型 ---

export interface JsonRpcRequest {
	jsonrpc: '2.0';
	id: number;
	method: string;
	params?: unknown;
}

export interface JsonRpcResponse {
	jsonrpc: '2.0';
	id: number;
	result?: unknown;
	error?: JsonRpcError;
}

export interface JsonRpcNotification {
	jsonrpc: '2.0';
	method: string;
	params?: unknown;
}

export interface JsonRpcError {
	code: number;
	message: string;
	data?: unknown;
}

export type JsonRpcMessage = JsonRpcRequest | JsonRpcResponse | JsonRpcNotification;

// --- 传输层接口 ---

export interface NdJsonTransport {
	/** 发送原始字节 */
	send(data: Uint8Array): void;
	/** 注册数据接收回调 */
	onData(callback: (data: Uint8Array) => void): void;
	/** 注册连接关闭回调 */
	onClose(callback: () => void): void;
	/** 关闭传输 */
	close(): void;
}

// --- JSON-RPC 连接 ---

type RequestHandler = (method: string, params: any) => Promise<unknown>;
type NotificationHandler = (method: string, params: any) => void;
type MessageObserver = (direction: 'send' | 'recv', msg: JsonRpcMessage) => void;

interface PendingRequest {
	resolve: (result: unknown) => void;
	reject: (error: Error) => void;
}

export class JsonRpcConnection {
	private transport: NdJsonTransport;
	private lineBuffer = '';
	private pendingRequests = new Map<number, PendingRequest>();
	private nextId = 1;
	private requestHandler: RequestHandler | null = null;
	private notificationHandler: NotificationHandler | null = null;
	private messageObserver: MessageObserver | null = null;
	private closedResolve: (() => void) | null = null;
	private closedPromise: Promise<void>;
	private disposed = false;
	private decoder = new TextDecoder();
	private encoder = new TextEncoder();

	constructor(transport: NdJsonTransport) {
		this.transport = transport;

		this.closedPromise = new Promise<void>((resolve) => {
			this.closedResolve = resolve;
		});

		transport.onData((data: Uint8Array) => {
			if (this.disposed) return;
			this.onRawData(data);
		});

		transport.onClose(() => {
			this.handleClose();
		});
	}

	/** 发送 JSON-RPC 请求，返回响应结果 */
	sendRequest<T = unknown>(method: string, params?: unknown): Promise<T> {
		const id = this.nextId++;
		const msg: JsonRpcRequest = {
			jsonrpc: '2.0',
			id,
			method,
			params,
		};

		return new Promise<T>((resolve, reject) => {
			this.pendingRequests.set(id, {
				resolve: resolve as (v: unknown) => void,
				reject,
			});
			this.sendMessage(msg);
		});
	}

	/** 发送 JSON-RPC 通知（无需响应） */
	sendNotification(method: string, params?: unknown): void {
		const msg: JsonRpcNotification = {
			jsonrpc: '2.0',
			method,
			params,
		};
		this.sendMessage(msg);
	}

	/** 注册收到请求时的处理器 */
	onRequest(handler: RequestHandler): void {
		this.requestHandler = handler;
	}

	/** 注册收到通知时的处理器 */
	onNotification(handler: NotificationHandler): void {
		this.notificationHandler = handler;
	}

	/** 注册消息观察器（用于协议调试） */
	onMessage(observer: MessageObserver): void {
		this.messageObserver = observer;
	}

	/** 连接关闭 Promise */
	get closed(): Promise<void> {
		return this.closedPromise;
	}

	dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.transport.close();
		this.handleClose();
	}

	// --- 内部方法 ---

	private sendMessage(msg: JsonRpcMessage): void {
		if (this.disposed) return;
		this.messageObserver?.('send', msg);
		const line = JSON.stringify(msg) + '\n';
		this.transport.send(this.encoder.encode(line));
	}

	private onRawData(data: Uint8Array): void {
		this.lineBuffer += this.decoder.decode(data, { stream: true });
		const lines = this.lineBuffer.split('\n');
		// 最后一个元素可能是不完整的行
		this.lineBuffer = lines.pop() || '';

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			try {
				const msg = JSON.parse(trimmed) as JsonRpcMessage;
				this.messageObserver?.('recv', msg);
				this.dispatch(msg);
			} catch (err) {
				logger.log('Failed to parse JSON:', trimmed, err);
			}
		}
	}

	private dispatch(msg: JsonRpcMessage): void {
		if ('id' in msg && msg.id !== undefined && msg.id !== null) {
			if ('method' in msg) {
				// 收到请求
				this.handleRequest(msg as JsonRpcRequest);
			} else {
				// 收到响应
				this.handleResponse(msg as JsonRpcResponse);
			}
		} else if ('method' in msg) {
			// 收到通知
			this.handleNotification(msg as JsonRpcNotification);
		}
	}

	private handleRequest(req: JsonRpcRequest): void {
		if (!this.requestHandler) {
			// 无处理器，返回 method not found
			this.sendMessage({
				jsonrpc: '2.0',
				id: req.id,
				error: { code: -32601, message: 'Method not found' },
			});
			return;
		}

		this.requestHandler(req.method, req.params)
			.then((result) => {
				this.sendMessage({
					jsonrpc: '2.0',
					id: req.id,
					result: result ?? null,
				});
			})
			.catch((err) => {
				const error: JsonRpcError =
					err && typeof err === 'object' && 'code' in err
						? { code: err.code, message: err.message, data: err.data }
						: { code: -32000, message: err instanceof Error ? err.message : String(err) };

				this.sendMessage({
					jsonrpc: '2.0',
					id: req.id,
					error,
				});
			});
	}

	private handleResponse(res: JsonRpcResponse): void {
		const pending = this.pendingRequests.get(res.id);
		if (!pending) {
			logger.error('Received response for unknown id:', res.id);
			return;
		}

		this.pendingRequests.delete(res.id);

		if (res.error) {
			const err = new Error(res.error.message);
			(err as any).code = res.error.code;
			(err as any).data = res.error.data;
			pending.reject(err);
		} else {
			pending.resolve(res.result);
		}
	}

	private handleNotification(ntf: JsonRpcNotification): void {
		this.notificationHandler?.(ntf.method, ntf.params);
	}

	private handleClose(): void {
		if (!this.closedResolve) return; // 防止 dispose() 内部 transport.close() 触发 onClose 后再次调用
		const resolve = this.closedResolve;
		this.closedResolve = null;
		for (const [, pending] of this.pendingRequests) {
			pending.reject(new Error('Connection closed'));
		}
		this.pendingRequests.clear();
		resolve();
	}
}
