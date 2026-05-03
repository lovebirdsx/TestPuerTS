#!/usr/bin/env node
/**
 * mcp-bridge CLI 入口。
 *
 * agent spawn 模型：editor 注入 ACP `mcpServers` 时把命令拼成
 *   { command: "node", args: ["<absolute>/dist/main.js", "--pipe", "<pipeName>"] }
 * agent 通过 stdio 启动本进程，本进程在 stdio 与 editor 命名管道间双向转发 ndjson。
 */
import { runBridge } from './runBridge';

function parseArgs(argv: string[]): { pipeName: string; clientId?: string } {
	let pipeName: string | undefined;
	let clientId: string | undefined;
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--pipe' || arg === '-p') {
			pipeName = argv[++i];
		} else if (arg === '--client-id') {
			clientId = argv[++i];
		} else if (arg === '--help' || arg === '-h') {
			printUsage();
			process.exit(0);
		}
	}
	if (!pipeName) {
		printUsage();
		process.exit(2);
	}
	return { pipeName, clientId };
}

function printUsage() {
	process.stderr.write(
		[
			'Usage: ue-mcp-bridge --pipe <name> [--client-id <id>]',
			'',
			'  --pipe, -p     editor 端命名管道名（必填，例如 \\\\.\\pipe\\ue-mcp-xxx）',
			'  --client-id    bridge 客户端标识（默认 mcp-bridge）',
			'',
		].join('\n'),
	);
}

async function main() {
	const { pipeName, clientId } = parseArgs(process.argv.slice(2));
	try {
		const handle = await runBridge({ pipeName, clientId });

		const onSignal = () => handle.close();
		process.on('SIGINT', onSignal);
		process.on('SIGTERM', onSignal);

		await handle.done;
		process.exit(0);
	} catch (err) {
		process.stderr.write(`[mcp-bridge] fatal: ${String(err)}\n`);
		process.exit(1);
	}
}

main();
