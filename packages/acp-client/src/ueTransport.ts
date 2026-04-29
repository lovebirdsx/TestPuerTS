/**
 * 将 C++ UIPCTransport 包装为 NdJsonTransport 接口。
 * 复用 packages/tests/src/ipc/ueIpcSocket.ts 的模式。
 */
import * as UE from 'ue';
import type { NdJsonTransport } from './jsonrpc';

export class UeNdJsonTransport implements NdJsonTransport {
	private readonly transport: UE.IPCTransport;
	private dataCallback: ((data: Uint8Array) => void) | null = null;
	private closeCallback: (() => void) | null = null;
	private disposed = false;

	constructor(transport: UE.IPCTransport) {
		this.transport = transport;

		transport.OnDataAvailable.Add(() => {
			if (this.disposed) return;
			const ab: ArrayBuffer = transport.ReadBuffer();
			if (ab && ab.byteLength > 0) {
				this.dataCallback?.(new Uint8Array(ab));
			}
		});

		transport.OnClosed.Add(() => {
			if (this.disposed) return;
			this.closeCallback?.();
		});
	}

	send(data: Uint8Array): void {
		if (this.disposed) return;
		const ab =
			data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
				? data.buffer
				: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
		this.transport.SendBuffer(ab as ArrayBuffer);
	}

	onData(callback: (data: Uint8Array) => void): void {
		this.dataCallback = callback;
	}

	onClose(callback: () => void): void {
		this.closeCallback = callback;
	}

	close(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.transport.Close();
	}
}

/**
 * 创建 UIPCTransport 并连接到指定管道（客户端模式）。
 * 支持重试，等待服务端就绪。
 */
export function connectUeIpc(pipeName: string, timeoutMs = 15000): Promise<UeNdJsonTransport> {
	return new Promise<UeNdJsonTransport>((resolve, reject) => {
		let resolved = false;
		const startTime = Date.now();

		const tryConnect = () => {
			if (resolved) return;

			if (Date.now() - startTime > timeoutMs) {
				reject(new Error(`Connect to ${pipeName} timed out`));
				return;
			}

			const transport = new UE.IPCTransport();

			transport.OnConnected.Add(() => {
				if (!resolved) {
					resolved = true;
					resolve(new UeNdJsonTransport(transport));
				}
			});

			transport.Connect(pipeName);

			if (!resolved && transport.IsConnected()) {
				resolved = true;
				resolve(new UeNdJsonTransport(transport));
				return;
			}

			// 如果连接未建立，短暂等待后重试
			if (!resolved) {
				transport.Close();
				setTimeout(() => tryConnect(), 500);
			}
		};

		tryConnect();
	});
}
