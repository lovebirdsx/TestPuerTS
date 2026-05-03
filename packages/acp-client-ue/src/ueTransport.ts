/**
 * 将 C++ UChildProcess 包装为 NdJsonTransport 接口。
 * 直接启动 ACP Server 子进程，通过 stdio 通信，无需中转。
 */
import * as UE from 'ue';
import type { NdJsonTransport } from './jsonrpc';

export interface AcpServerOptions {
	/** 可执行文件路径 */
	executable: string;
	/** 命令行参数字符串 */
	args: string;
	/** 工作目录 */
	workspace: string;
}

export class ChildProcessTransport implements NdJsonTransport {
	private proc: UE.ChildProcess;
	private dataCallback: ((data: Uint8Array) => void) | null = null;
	private closeCallback: (() => void) | null = null;
	private disposed = false;

	constructor(proc: UE.ChildProcess) {
		this.proc = proc;

		proc.OnStdoutDataAvailable.Add(() => {
			if (this.disposed) return;
			const ab: ArrayBuffer = proc.ReadStdout();
			if (ab && ab.byteLength > 0) {
				this.dataCallback?.(new Uint8Array(ab));
			}
		});

		proc.OnStderrDataAvailable.Add(() => {
			if (this.disposed) return;
			const text = proc.ReadStderrString();
			if (text) {
				UE.ProcessIOHelper.WriteStderr(text);
			}
		});

		proc.OnExit.Add(() => {
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
		this.proc.WriteStdinBuffer(ab as ArrayBuffer);
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
		if (this.proc.IsRunning()) {
			this.proc.Kill(true);
		}
	}
}

/**
 * 启动 ACP Server 子进程，返回 NdJsonTransport。
 * 子进程自动继承父进程的完整环境变量（包括 OPENAI_* 等配置）。
 */
export function spawnAcpServer(options: AcpServerOptions): ChildProcessTransport {
	const proc = new UE.ChildProcess();
	const opts = new UE.ChildProcessOptions();
	opts.WorkingDir = options.workspace;
	opts.bHideWindow = true;

	const ok = proc.Spawn(options.executable, options.args, opts);
	if (!ok) {
		throw new Error(`Failed to spawn ACP server: ${options.executable} ${options.args}`);
	}

	return new ChildProcessTransport(proc);
}
