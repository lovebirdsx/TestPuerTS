import type { IDisposable, ISocket, SocketCloseEvent } from 'universe-lib';
import { Emitter, SocketDiagnosticsEventType, VSBuffer } from 'universe-lib';
import * as UE from 'ue';

export class UeIpcSocket implements ISocket {
	private readonly _onData = new Emitter<VSBuffer>();
	private readonly _onClose = new Emitter<SocketCloseEvent>();
	private readonly _onEnd = new Emitter<void>();
	private readonly transport: UE.IPCTransport;
	private disposed = false;

	constructor(transport: UE.IPCTransport) {
		this.transport = transport;

		transport.OnDataAvailable.Add(() => {
			if (this.disposed) return;
			const ab: ArrayBuffer = transport.ReadBuffer();
			if (ab && ab.byteLength > 0) {
				this._onData.fire(VSBuffer.wrap(new Uint8Array(ab)));
			}
		});

		transport.OnClosed.Add(() => {
			if (this.disposed) return;
			this._onClose.fire(undefined);
			this._onEnd.fire();
		});
	}

	onData(listener: (e: VSBuffer) => void): IDisposable {
		return this._onData.event(listener);
	}

	onClose(listener: (e: SocketCloseEvent) => void): IDisposable {
		return this._onClose.event(listener);
	}

	onEnd(listener: () => void): IDisposable {
		return this._onEnd.event(listener);
	}

	write(buffer: VSBuffer): void {
		if (this.disposed) return;
		const uint8 = buffer.buffer;
		const ab =
			uint8.byteOffset === 0 && uint8.byteLength === uint8.buffer.byteLength
				? uint8.buffer
				: uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength);
		this.transport.SendBuffer(ab as ArrayBuffer);
	}

	end(): void {
		if (!this.disposed) {
			this.transport.Close();
		}
	}

	drain(): Promise<void> {
		return Promise.resolve();
	}

	close(): void {
		this.dispose();
	}

	dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.transport.Close();
		this._onData.dispose();
		this._onClose.dispose();
		this._onEnd.dispose();
	}

	traceSocketEvent(_type: SocketDiagnosticsEventType, _data?: any): void {
		// no-op
	}
}

/**
 * 创建 UIPCTransport 并连接到指定管道（客户端模式）。
 * 支持重试，等待服务端就绪。
 */
export function connectUeIpc(pipeName: string, timeoutMs = 15000): Promise<UeIpcSocket> {
	return new Promise<UeIpcSocket>((resolve, reject) => {
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
					resolve(new UeIpcSocket(transport));
				}
			});

			transport.Connect(pipeName);

			if (!resolved && transport.IsConnected()) {
				resolved = true;
				resolve(new UeIpcSocket(transport));
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

/**
 * 创建 UIPCTransport 并监听指定管道（服务端模式）。
 */
export function listenUeIpc(pipeName: string): Promise<UeIpcSocket> {
	return new Promise<UeIpcSocket>((resolve, reject) => {
		const transport = new UE.IPCTransport();
		let resolved = false;

		transport.OnConnected.Add(() => {
			if (!resolved) {
				resolved = true;
				resolve(new UeIpcSocket(transport));
			}
		});

		transport.Listen(pipeName);

		setTimeout(() => {
			if (!resolved) {
				reject(new Error(`Listen on ${pipeName} timed out`));
			}
		}, 10000);
	});
}
