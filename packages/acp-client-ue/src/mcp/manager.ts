/**
 * acp-client-ue 端 MCP Server 生命周期管理。
 *
 * 一个 ACP session 对应一组：
 *   - 一个 universe-lib 命名管道 server（在当前 PuerTS 进程内）
 *   - 一个 mcp-server-ue 实例（注册 UE tools）
 *   - 一份 ACP `mcpServers` 数组（含内置 ue-editor entry + 项目配置中的 external entries）
 *
 * agent 收到 `mcpServers` 后会 spawn `node mcp-bridge/dist/main.js --pipe <name>`，
 * bridge 进程通过命名管道接入 PuerTS 进程，把 stdio 帧透明转给 McpServer。
 */
import * as UE from 'ue';
import { startUeMcpServer, type UeMcpServerHandle } from '@universe-agent/mcp-server-ue';
import type { McpServerEntry } from '../types';
import type { McpServersConfig } from './config';
import { DEFAULT_MCP_CONFIG, loadMcpServersConfig } from './config';

/** 项目根 mcp-servers.json 路径。 */
export function defaultMcpConfigPath(): string {
	return UE.JsRunHelper.GetProjectDir() + '/mcp-servers.json';
}

/** mcp-bridge 编译产物入口；agent 通过 node 执行。 */
export function defaultBridgeEntry(): string {
	return UE.JsRunHelper.GetProjectDir() + '/packages/mcp-bridge/dist/main.js';
}

interface ActiveSession {
	sessionId: string;
	pipeName: string;
	handle: UeMcpServerHandle;
}

export interface BuildSessionMcpListResult {
	servers: McpServerEntry[];
	warnings: string[];
}

export interface McpManagerOptions {
	/** 覆盖 mcp-servers.json 路径（测试用）。 */
	configPath?: string;
	/** 覆盖 mcp-bridge 入口路径（测试用）。 */
	bridgeEntry?: string;
}

export class McpManager {
	private readonly configPath: string;
	private readonly bridgeEntry: string;
	private readonly sessions = new Map<string, ActiveSession>();
	private cachedConfig: McpServersConfig | null = null;

	constructor(options: McpManagerOptions = {}) {
		this.configPath = options.configPath ?? defaultMcpConfigPath();
		this.bridgeEntry = options.bridgeEntry ?? defaultBridgeEntry();
	}

	/**
	 * 启动一个 session 的内置 ue-editor MCP server，并返回其 ACP entry。
	 * sessionId 任意稳定字符串即可（可用 nonce）；同名重复调用先 stop。
	 */
	startSession(sessionId: string): McpServerEntry {
		this.stopSession(sessionId);
		const pipeName = makePipeName(sessionId);
		const handle = startUeMcpServer({
			pipeName,
			registerBuiltins: this.cachedConfig?.builtin.ueEditor.enableBuiltinTools ?? true,
		});
		// 主动触发 ready()：让 mcp.connect() 在 bridge 接入时立即完成，
		// 避免 bridge 先于 handler 注册发帧时依赖 pending buffer 的窗口期。
		handle.ready().catch(() => {
			// bridge 未接入或 dispose 前 reject，忽略（dispose 会清理）
		});
		this.sessions.set(sessionId, { sessionId, pipeName, handle });
		return {
			name: 'ue-editor',
			command: 'node',
			args: [this.bridgeEntry, '--pipe', pipeName],
			env: [],
		};
	}

	/** 关闭某个 session 对应的 MCP server。 */
	stopSession(sessionId: string): void {
		const active = this.sessions.get(sessionId);
		if (!active) return;
		try {
			active.handle.dispose();
		} catch {
			// ignore
		}
		this.sessions.delete(sessionId);
	}

	/** 关闭全部 session。 */
	dispose(): void {
		for (const id of [...this.sessions.keys()]) {
			this.stopSession(id);
		}
	}

	hasSession(sessionId: string): boolean {
		return this.sessions.has(sessionId);
	}

	/** 读取并缓存 mcp-servers.json；解析失败返回默认配置并附带 warning。 */
	async loadConfig(force = false): Promise<{ config: McpServersConfig; warning?: string }> {
		if (!force && this.cachedConfig) {
			return { config: this.cachedConfig };
		}
		const result = await loadMcpServersConfig(this.configPath);
		this.cachedConfig = result.config;
		return result;
	}

	/**
	 * 组装下发给 ACP `session/new`/`session/load` 的 mcpServers 数组。
	 * 顺序：内置 ue-editor（若启用） + 项目配置中的 external server。
	 */
	async buildSessionMcpList(sessionId: string): Promise<BuildSessionMcpListResult> {
		const warnings: string[] = [];
		const { config, warning } = await this.loadConfig();
		if (warning) warnings.push(warning);

		const servers: McpServerEntry[] = [];

		if (!config.enabled) {
			return { servers, warnings };
		}

		if (config.builtin.ueEditor.enabled) {
			servers.push(this.startSession(sessionId));
		}

		for (const [name, entry] of Object.entries(config.external)) {
			servers.push({
				name,
				command: entry.command,
				args: entry.args ?? [],
				env: entry.env ? Object.entries(entry.env).map(([n, v]) => ({ name: n, value: v })) : [],
			});
		}

		return { servers, warnings };
	}
}

function makePipeName(sessionId: string): string {
	const safe = sessionId.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 32);
	const nonce = Math.random().toString(36).slice(2, 8);
	return `\\\\.\\pipe\\ue-mcp-${safe}-${nonce}`;
}

export const DEFAULT_MCP_MANAGER_CONFIG: McpServersConfig = DEFAULT_MCP_CONFIG;
