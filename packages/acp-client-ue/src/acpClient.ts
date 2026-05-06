/**
 * AcpClient: ACP UI 控制器 + MCP 生命周期管理的 facade。
 *
 * 把"读 mcp-servers.json → 启动内置 ue-editor server → 在 session/new/load 前注入 mcpServers
 * → session 切换/断开时释放命名管道"这套接线封装在一处，让调用方（React 面板、CLI）
 * 直接调 `newSession()` / `loadSession()` 即可，无需手动管 MCP。
 *
 * 不修改协议层：底层仍是 `AcpUiController` + `ACPClient`，事件订阅 / 状态读取等 API
 * 通过 `client.controller` 直接暴露给 UI，避免代理一长串透传方法。
 */
import type { AcpTransportFactory } from './client';
import { McpManager, type McpManagerOptions } from './mcp/manager';
import { AcpUiController, type AcpUiControllerOptions } from './uiController';

export interface AcpClientOptions extends AcpUiControllerOptions {
	/**
	 * MCP 配置。
	 *   - 不传 / 传 object：启用 MCP，读取 `<ProjectDir>/mcp-servers.json`，可选覆盖路径。
	 *   - 传 `false`：完全关闭 MCP（仅调试 ACP 协议时使用）。
	 */
	mcp?: McpManagerOptions | false;
}

export class AcpClient {
	readonly controller: AcpUiController;
	private readonly mcp: McpManager | null;
	private currentMcpSession: string | null = null;

	constructor(options: AcpClientOptions, transportFactory?: AcpTransportFactory) {
		this.controller = new AcpUiController(options, transportFactory);
		this.mcp = options.mcp === false ? null : new McpManager(options.mcp);
	}

	/** 直接转发到 controller；连接成功后即可订阅事件 / 读取状态。 */
	connect(): Promise<void> {
		return this.controller.connect();
	}

	/** 释放 MCP session，再断开 ACP 连接。 */
	async disconnect(): Promise<void> {
		this.releaseMcpSession();
		await this.controller.disconnect();
	}

	/** 启动新 session：先准备 MCP，再下发 ACP `session/new`。返回 MCP 配置 warnings。 */
	async newSession(): Promise<{ warnings: string[] }> {
		const warnings = await this.prepareMcp(`new-${Date.now().toString(36)}`);
		await this.controller.newSession();
		return { warnings };
	}

	/** 加载已有 session：先准备 MCP，再下发 ACP `session/load`。返回 MCP 配置 warnings。 */
	async loadSession(sessionId: string): Promise<{ warnings: string[] }> {
		const warnings = await this.prepareMcp(`load-${sessionId}`);
		await this.controller.loadSession(sessionId);
		return { warnings };
	}

	/** 销毁 facade：释放 MCP + 断开协议（dispose 比 disconnect 更明确包含 MCP 全量清理）。 */
	async dispose(): Promise<void> {
		this.releaseMcpSession();
		await this.controller.disconnect();
		this.mcp?.dispose();
	}

	/** 暴露 manager 供高级用法（如手动 reload 配置 / 查询当前 session）。 */
	getMcpManager(): McpManager | null {
		return this.mcp;
	}

	private async prepareMcp(sessionKey: string): Promise<string[]> {
		if (!this.mcp) return [];
		this.releaseMcpSession();
		const { servers, warnings } = await this.mcp.buildSessionMcpList(sessionKey);
		this.currentMcpSession = sessionKey;
		this.controller.setMcpServers(servers);
		return warnings;
	}

	private releaseMcpSession(): void {
		if (!this.mcp || !this.currentMcpSession) return;
		this.mcp.stopSession(this.currentMcpSession);
		this.currentMcpSession = null;
	}
}
