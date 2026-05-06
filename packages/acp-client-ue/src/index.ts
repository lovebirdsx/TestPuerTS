// PuerTS polyfill：必须在引入任何依赖前安装。
import { installPuertsTimerPolyfill } from '@universe-agent/editor-common';
installPuertsTimerPolyfill();

import * as UE from 'ue';
import { parseCliOptions, type CliMcpConfig } from './cli';
import { ACPClient } from './client';
import { McpManager } from './mcp/manager';
import { Renderer } from './renderer';
import { Repl } from './repl';
import { fmt, createSpinner } from './format';
import { createLogger } from '@universe-agent/editor-common';

const logger = createLogger('acp-client:main');

async function main(): Promise<void> {
	const { options, prompt, mcp } = parseCliOptions();

	const renderer = new Renderer({
		protocol: options.protocol,
		verbose: options.verbose,
	});

	const client = new ACPClient(renderer, options);
	const mcpManager = makeMcpManager(mcp);
	let currentMcpSession: string | null = null;

	async function injectMcpFor(sessionKey: string): Promise<void> {
		if (!mcpManager) return;
		if (currentMcpSession) mcpManager.stopSession(currentMcpSession);
		const { servers, warnings } = await mcpManager.buildSessionMcpList(sessionKey);
		currentMcpSession = sessionKey;
		client.setMcpServers(servers);
		for (const warning of warnings) {
			logger.warn(`MCP config: ${warning}`);
		}
	}

	function disposeMcp(): void {
		if (!mcpManager) return;
		mcpManager.dispose();
		currentMcpSession = null;
	}

	// 连接服务端
	const spinner = createSpinner('Connecting to ACP server...');
	try {
		await client.connect();
		const initResult = await client.initialize();
		spinner.stop(
			fmt.green(`Connected to ${initResult.agentInfo?.name ?? 'agent'} ${initResult.agentInfo?.version ?? ''}`),
		);
	} catch (err) {
		spinner.stop();
		logger.error(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
		disposeMcp();
		UE.JsRunHelper.MarkDone(1);
		return;
	}

	// 创建或加载会话
	try {
		if (options.session) {
			await injectMcpFor(`load-${options.session}`);
			await client.loadSession(options.session);
			UE.ProcessIOHelper.WriteStderr(fmt.dim(`Session loaded: ${client.sessionId}\n`));
		} else {
			await injectMcpFor(`new-${Date.now().toString(36)}`);
			await client.newSession();
			UE.ProcessIOHelper.WriteStderr(fmt.dim(`Session created: ${client.sessionId}\n`));
		}
	} catch (err) {
		logger.error(`Failed to create session: ${err instanceof Error ? err.message : String(err)}`);
		await client.disconnect();
		disposeMcp();
		UE.JsRunHelper.MarkDone(1);
		return;
	}

	// 若指定了初始模式则进行设置
	if (options.mode) {
		try {
			await client.setMode(options.mode);
		} catch (err) {
			logger.error(`Failed to set mode: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	// 单次执行模式或 REPL 模式
	if (prompt) {
		try {
			const result = await client.prompt(prompt);
			renderer.ensureNewline();
			UE.ProcessIOHelper.WriteStderr(fmt.dim(`[Stop reason: ${result.stopReason}]\n`));
		} catch (err) {
			renderer.ensureNewline();
			logger.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		}
		await client.disconnect();
		disposeMcp();
		UE.JsRunHelper.MarkDone(0);
	} else {
		const repl = new Repl(client, renderer, mcpManager ? injectMcpFor : undefined);
		await repl.start();
		await client.disconnect();
		disposeMcp();
		UE.JsRunHelper.MarkDone(0);
	}
}

function makeMcpManager(mcp: CliMcpConfig): McpManager | null {
	if (mcp === false) return null;
	return new McpManager(mcp.configPath ? { configPath: mcp.configPath } : {});
}

main().catch((err) => {
	logger.error(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
	UE.JsRunHelper.MarkDone(1);
});
