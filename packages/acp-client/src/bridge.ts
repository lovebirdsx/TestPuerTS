/**
 * Node.js 桥接脚本：命名管道 ↔ ACP Server stdio 双向中继。
 * 由 PuerTS 通过 SpawnProcess 启动。
 *
 * 用法: node bridge.js --pipe <pipeName> --workspace <dir> [-- <acp-server-args...>]
 */
import * as net from 'net';
import { spawn, type ChildProcess } from 'child_process';

// 解析参数
const args = process.argv.slice(2);
let pipeName = '\\\\.\\pipe\\puerts-acp-bridge';
let workspace = process.cwd();
let acpCommand = 'npx';
const acpArgs: string[] = ['universe-agent-acp'];
let extraArgs: string[] = [];

for (let i = 0; i < args.length; i++) {
	if (args[i] === '--pipe' && args[i + 1]) {
		pipeName = args[++i]!;
	} else if (args[i] === '--workspace' && args[i + 1]) {
		workspace = args[++i]!;
	} else if (args[i] === '--acp-command' && args[i + 1]) {
		acpCommand = args[++i]!;
	} else if (args[i] === '--') {
		extraArgs = args.slice(i + 1);
		break;
	} else {
		extraArgs.push(args[i]!);
	}
}

let acpServer: ChildProcess | null = null;
let pipeConnection: net.Socket | null = null;
let shuttingDown = false;

function cleanup() {
	if (shuttingDown) return;
	shuttingDown = true;

	if (acpServer && !acpServer.killed) {
		acpServer.kill();
	}
	if (pipeConnection && !pipeConnection.destroyed) {
		pipeConnection.destroy();
	}
	// 短暂延迟后退出
	setTimeout(() => process.exit(0), 200);
}

// 创建命名管道服务器
const server = net.createServer((connection) => {
	console.error('[bridge] PuerTS 已连接管道');
	pipeConnection = connection;

	// 启动 ACP Server
	const serverArgs = [...acpArgs, '--workspace', workspace, ...extraArgs];
	console.error(`[bridge] 启动 ACP Server: ${acpCommand} ${serverArgs.join(' ')}`);

	acpServer = spawn(acpCommand, serverArgs, {
		stdio: ['pipe', 'pipe', 'inherit'],
		shell: true,
		cwd: workspace,
		env: process.env,
	});

	acpServer.on('error', (err) => {
		console.error(`[bridge] ACP Server 启动失败: ${err.message}`);
		cleanup();
	});

	acpServer.on('exit', (code) => {
		console.error(`[bridge] ACP Server 退出: ${code}`);
		cleanup();
	});

	// 管道 → ACP Server stdin
	connection.on('data', (data: Buffer) => {
		if (acpServer?.stdin && !acpServer.stdin.destroyed) {
			acpServer.stdin.write(data);
		}
	});

	// ACP Server stdout → 管道
	acpServer.stdout?.on('data', (data: Buffer) => {
		if (pipeConnection && !pipeConnection.destroyed) {
			pipeConnection.write(data);
		}
	});

	connection.on('close', () => {
		console.error('[bridge] PuerTS 断开管道');
		cleanup();
	});

	connection.on('error', (err) => {
		console.error(`[bridge] 管道错误: ${err.message}`);
		cleanup();
	});
});

server.listen(pipeName, () => {
	console.error(`[bridge] 管道服务器启动: ${pipeName}`);
	// 输出 READY 标记（PuerTS 可检测）
	console.error('[bridge] BRIDGE_READY');
});

server.on('error', (err) => {
	console.error(`[bridge] 管道服务器错误: ${err.message}`);
	process.exit(1);
});

// 信号处理
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 超时退出（5 分钟无连接）
const connectTimeout = setTimeout(() => {
	if (!pipeConnection) {
		console.error('[bridge] 等待连接超时');
		process.exit(1);
	}
}, 300000);

server.on('connection', () => {
	clearTimeout(connectTimeout);
});
