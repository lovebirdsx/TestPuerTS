/**
 * bridge 核心逻辑：作为 universe-lib client 反向连接到 editor 进程，
 * 在 stdin/stdout 与 editor 间双向中继 ndjson 形式的 MCP 消息。
 */
import * as readline from 'node:readline';
import { ProxyChannel } from 'universe-lib';
import { connect } from 'universe-lib/node';
import { BRIDGE_CALLBACK_CHANNEL, BRIDGE_CHANNEL, type IMcpBridgeCallback, type IMcpBridgeService } from './shared';

export interface RunBridgeOptions {
	/** 命名管道名（如 \\.\pipe\ue-mcp-<sessionId>-<nonce>） */
	pipeName: string;
	/** 可选：bridge 客户端 ID，便于 editor 区分（默认 'mcp-bridge'） */
	clientId?: string;
	/** 可选：自定义 stdin/stdout，便于测试 */
	stdin?: NodeJS.ReadableStream;
	stdout?: NodeJS.WritableStream;
	/** 可选：日志输出（默认到 stderr，避免污染 MCP stdio） */
	logger?: (msg: string) => void;
}

export interface BridgeHandle {
	/** 等待 bridge 自然结束（agent stdin 关闭或 editor 断开）。 */
	done: Promise<void>;
	/** 主动停止 bridge。 */
	close: () => void;
}

export async function runBridge(options: RunBridgeOptions): Promise<BridgeHandle> {
	const stdin = options.stdin ?? process.stdin;
	const stdout = options.stdout ?? process.stdout;
	const log = options.logger ?? ((msg: string) => process.stderr.write(`[mcp-bridge] ${msg}\n`));

	const client = await connect(options.pipeName, options.clientId ?? 'mcp-bridge');
	log(`connected to editor pipe ${options.pipeName}`);

	let closed = false;
	let resolveDone: () => void;
	const done = new Promise<void>((resolve) => {
		resolveDone = resolve;
	});

	const callback: IMcpBridgeCallback = {
		async pushToAgent(line: string): Promise<void> {
			if (closed) return;
			stdout.write(line + '\n');
		},
	};
	client.registerChannel(BRIDGE_CALLBACK_CHANNEL, ProxyChannel.fromService(callback));

	const channel = client.getChannel(BRIDGE_CHANNEL);
	const service = ProxyChannel.toService<IMcpBridgeService>(channel);

	const rl = readline.createInterface({ input: stdin, crlfDelay: Infinity });

	const close = () => {
		if (closed) return;
		closed = true;
		try {
			rl.close();
		} catch {
			// ignore
		}
		try {
			client.dispose();
		} catch {
			// ignore
		}
		resolveDone();
	};

	rl.on('line', (line) => {
		if (closed) return;
		if (!line) return;
		service.forwardFromAgent(line).catch((err: unknown) => {
			log(`forwardFromAgent error: ${String(err)}`);
		});
	});

	rl.on('close', () => {
		log('stdin closed');
		close();
	});

	stdin.on('error', (err) => {
		log(`stdin error: ${String(err)}`);
		close();
	});

	return { done, close };
}
