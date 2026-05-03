import type { NdJsonTransport } from '@universe-agent/acp-client-ue';

/**
 * 创建一对内存中互联的 NdJsonTransport，模拟 ACP client ↔ server 之间的 ndjson 通道。
 * 用于在 PuerTS 内单进程地测试 JsonRpcConnection / ACPClient，无需子进程或管道。
 *
 * 与 mcp/inMemoryBridgeLink 的差异：
 * - BridgeLink 操作字符串行；
 * - NdJsonTransport 操作 Uint8Array 字节，更贴近真实 ChildProcessTransport。
 */
export function createTransportPair(): { client: InMemoryNdJsonTransport; server: InMemoryNdJsonTransport } {
	const a = new InMemoryNdJsonTransport();
	const b = new InMemoryNdJsonTransport();
	a.attach(b);
	b.attach(a);
	return { client: a, server: b };
}

export class InMemoryNdJsonTransport implements NdJsonTransport {
	private peer: InMemoryNdJsonTransport | null = null;
	private dataCallback: ((d: Uint8Array) => void) | null = null;
	private closeCallbacks: (() => void)[] = [];
	private closed = false;
	private pending: Uint8Array[] = [];
	private decoder = new TextDecoder();

	attach(peer: InMemoryNdJsonTransport): void {
		this.peer = peer;
	}

	send(data: Uint8Array): void {
		if (this.closed) return;
		this.peer?.deliver(data);
	}

	deliver(data: Uint8Array): void {
		if (this.closed) return;
		if (this.dataCallback) {
			this.dataCallback(data);
		} else {
			this.pending.push(data);
		}
	}

	onData(callback: (data: Uint8Array) => void): void {
		this.dataCallback = callback;
		while (this.pending.length > 0) {
			callback(this.pending.shift()!);
		}
	}

	onClose(callback: () => void): void {
		this.closeCallbacks.push(callback);
	}

	close(): void {
		if (this.closed) return;
		this.closed = true;
		for (const h of this.closeCallbacks) {
			try {
				h();
			} catch {
				// ignore
			}
		}
		this.peer?.handlePeerClose();
	}

	private handlePeerClose(): void {
		if (this.closed) return;
		this.closed = true;
		for (const h of this.closeCallbacks) {
			try {
				h();
			} catch {
				// ignore
			}
		}
	}

	/** 测试辅助：把字符串当作字节注入接收回调（绕过 send，模拟服务端推送）。 */
	pushRawString(s: string): void {
		if (this.closed) return;
		this.dataCallback?.(new TextEncoder().encode(s));
	}

	/** 测试辅助：解码已发送的字节序列为字符串（用于断言） */
	decode(data: Uint8Array): string {
		return this.decoder.decode(data);
	}
}
