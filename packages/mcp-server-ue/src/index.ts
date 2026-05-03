/**
 * mcp-server-ue 公共 API。基于 @modelcontextprotocol/sdk 实现。
 *
 * 典型用法（editor 端）：
 *
 *   const handle = startUeMcpServer({ pipeName: '\\\\.\\pipe\\ue-mcp-xxx' });
 *   // 把 handle.pipeName 拼成 ACP `mcpServers` 数组的 entry
 *   ...
 *   handle.dispose();
 */
import { McpServer } from '@modelcontextprotocol/sdk/dist/cjs/server/mcp';
import type { BridgeLink } from '@universe-agent/editor-common';
import { serveOnPipe, type PipeServerHandle } from './pipeServer';
import { BridgeTransport } from './bridgeTransport';
import { registerBuiltinTools } from './tools';

export interface StartMcpServerOptions {
	/** 命名管道名（如 \\.\pipe\ue-mcp-<sessionId>-<nonce>） */
	pipeName: string;
	/** 可选：自定义服务端名称 */
	name?: string;
	/** 可选：自定义版本 */
	version?: string;
	/** 可选：在内置 tool 之后追加更多 tool（拿到 SDK McpServer 自行 registerTool） */
	extraTools?: (server: McpServer) => void;
	/** 可选：是否注册内置 tool */
	registerBuiltins?: boolean;
}

export interface UeMcpServerHandle {
	readonly pipeName: string;
	/** 等待 bridge 接入并完成 server 构造；通常在 ACP session 开始时调用。 */
	ready(): Promise<McpServer>;
	dispose(): void;
}

export function startUeMcpServer(options: StartMcpServerOptions): UeMcpServerHandle {
	const pipeHandle: PipeServerHandle = serveOnPipe(options.pipeName);

	let serverPromise: Promise<McpServer> | null = null;
	let server: McpServer | null = null;

	function ready(): Promise<McpServer> {
		if (!serverPromise) {
			serverPromise = pipeHandle.waitForBridge().then(async (link: BridgeLink) => {
				const mcp = new McpServer({
					name: options.name ?? 'ue-editor',
					version: options.version ?? '1.0.0',
				});
				if (options.registerBuiltins) {
					registerBuiltinTools(mcp);
				}
				options.extraTools?.(mcp);
				await mcp.connect(new BridgeTransport(link));
				server = mcp;
				return mcp;
			});
		}
		return serverPromise;
	}

	return {
		pipeName: options.pipeName,
		ready,
		dispose(): void {
			if (server) {
				server.close().catch(() => {
					// ignore
				});
				server = null;
			}
			pipeHandle.dispose();
		},
	};
}

export { serveOnPipe, type PipeServerHandle } from './pipeServer';
export type { BridgeLink } from '@universe-agent/editor-common';
export { BridgeTransport } from './bridgeTransport';
export { registerBuiltinTools } from './tools';
export { McpServer } from '@modelcontextprotocol/sdk/dist/cjs/server/mcp';
