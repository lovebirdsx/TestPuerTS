/**
 * 静默 Renderer，避免测试日志污染 commandlet stdout/stderr。
 * 只实现 ACPClient/ACPClientHandler 实际用到的字段：
 *   - verbose
 *   - renderProtocolMessage
 *   - renderSessionUpdate
 * 通过 `as unknown as Renderer` 注入到 ACPClient。
 */
import type { JsonRpcMessage } from '@universe-agent/acp-client-ue';

export interface ProtocolLog {
	direction: 'send' | 'recv';
	message: JsonRpcMessage;
}

export class TestRenderer {
	verbose = false;
	protocol = false;
	public readonly protocolMessages: ProtocolLog[] = [];
	public readonly sessionUpdates: unknown[] = [];

	renderProtocolMessage(direction: 'send' | 'recv', msg: JsonRpcMessage): void {
		this.protocolMessages.push({ direction, message: msg });
	}

	renderSessionUpdate(notification: unknown): void {
		this.sessionUpdates.push(notification);
	}

	ensureNewline(): void {
		// no-op
	}
}
