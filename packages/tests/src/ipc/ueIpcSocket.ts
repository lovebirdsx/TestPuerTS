import type { ISocket, SocketCloseEvent, IDisposable } from '@universe/lib';
import { Emitter, VSBuffer, SocketDiagnosticsEventType } from '@universe/lib';
import * as UE from 'ue';

/**
 * 将 C++ UIPCTransport 包装为 universe-lib 的 ISocket 接口。
 * 使 PuerTS 端能复用 universe-lib 的 Protocol / IPCClient / IPCServer。
 */
export class UeIpcSocket implements ISocket {
	private readonly _onData = new Emitter<VSBuffer>();
	private readonly _onClose = new Emitter<SocketCloseEvent>();
	private readonly _onEnd = new Emitter<void>();
	private readonly transport: UE.IPCTransport;
	private disposed = false;

	constructor(transport: UE.IPCTransport) {
		this.transport = transport;

		// C++ 端在 Tick 中轮询管道数据，有数据时触发 OnDataAvailable
		// JS 在回调中调用 ReadBuffer() 获取 ArrayBuffer 数据
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
		// VSBuffer → ArrayBuffer → C++ SendBuffer(FArrayBuffer)
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
 */
export function connectUeIpc(pipeName: string): Promise<UeIpcSocket> {
	return new Promise<UeIpcSocket>((resolve, reject) => {
		const transport = new UE.IPCTransport();
		let resolved = false;

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
		}

		setTimeout(() => {
			if (!resolved) {
				reject(new Error(`Connect to ${pipeName} timed out`));
			}
		}, 10000);
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
