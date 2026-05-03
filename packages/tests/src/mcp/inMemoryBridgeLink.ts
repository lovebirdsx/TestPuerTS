import type { BridgeLink } from '@universe-agent/mcp-server-ue';

/**
 * 创建一对内存中互联的 BridgeLink，模拟 mcp-bridge ↔ editor 之间的 ndjson 通道。
 * 用于在 PuerTS 内单进程地测试 BridgeTransport / McpServer，无需真正起命名管道与子进程。
 */
export function createLinkedBridgeLinks(): [BridgeLink, BridgeLink] {
	const a = new InMemoryBridgeLink();
	const b = new InMemoryBridgeLink();
	a.attach(b);
	b.attach(a);
	return [a, b];
}

class InMemoryBridgeLink implements BridgeLink {
	private peer: InMemoryBridgeLink | null = null;
	private messageHandler: ((line: string) => void) | null = null;
	private closeHandlers: (() => void)[] = [];
	private closed = false;
	private pending: string[] = [];

	attach(peer: InMemoryBridgeLink): void {
		this.peer = peer;
	}

	send(line: string): void {
		if (this.closed) return;
		this.peer?.deliver(line);
	}

	deliver(line: string): void {
		if (this.closed) return;
		if (this.messageHandler) {
			this.messageHandler(line);
		} else {
			this.pending.push(line);
		}
	}

	onMessage(handler: (line: string) => void): void {
		this.messageHandler = handler;
		while (this.pending.length > 0) {
			handler(this.pending.shift()!);
		}
	}

	onClose(handler: () => void): void {
		this.closeHandlers.push(handler);
	}

	close(): void {
		if (this.closed) return;
		this.closed = true;
		for (const h of this.closeHandlers) {
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
		for (const h of this.closeHandlers) {
			try {
				h();
			} catch {
				// ignore
			}
		}
	}
}
