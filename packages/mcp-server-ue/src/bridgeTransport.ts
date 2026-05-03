import type { Transport, TransportSendOptions } from '@modelcontextprotocol/sdk/dist/cjs/shared/transport';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/dist/cjs/types';
import type { BridgeLink } from './pipeServer';

export class BridgeTransport implements Transport {
	onmessage?: (msg: JSONRPCMessage) => void;
	onclose?: () => void;
	onerror?: (err: Error) => void;
	sessionId?: string;

	constructor(private readonly link: BridgeLink) {}

	start(): Promise<void> {
		this.link.onMessage((line) => {
			const trimmed = line.trim();
			if (!trimmed) return;
			let msg: JSONRPCMessage;
			try {
				msg = JSON.parse(trimmed) as JSONRPCMessage;
			} catch (err) {
				this.onerror?.(err instanceof Error ? err : new Error(String(err)));
				return;
			}
			try {
				this.onmessage?.(msg);
			} catch (err) {
				this.onerror?.(err instanceof Error ? err : new Error(String(err)));
			}
		});
		this.link.onClose(() => this.onclose?.());
		return Promise.resolve();
	}

	send(message: JSONRPCMessage, _options?: TransportSendOptions): Promise<void> {
		try {
			this.link.send(JSON.stringify(message));
		} catch (err) {
			return Promise.reject(err instanceof Error ? err : new Error(String(err)));
		}
		return Promise.resolve();
	}

	close(): Promise<void> {
		this.link.close();
		return Promise.resolve();
	}
}
