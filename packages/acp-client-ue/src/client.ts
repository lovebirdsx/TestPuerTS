import * as UE from 'ue';
import { JsonRpcConnection } from './jsonrpc';
import { spawnAcpServer } from './ueTransport';
import { Renderer } from './renderer';
import type { CliOptions } from './cli';
import {
	PROTOCOL_VERSION,
	type InitializeResponse,
	type ListSessionsResponse,
	type McpServerEntry,
	type RequestPermissionRequest,
	type RequestPermissionResponse,
	type SessionConfigOption,
	type SessionInfo,
	type SessionModeState,
	type SessionNotification,
	type SessionStartResponse,
} from './types';

export { PROTOCOL_VERSION };
export type {
	AgentCapabilities,
	InitializeResponse,
	ListSessionsResponse,
	McpServerEntry,
	RequestPermissionRequest,
	RequestPermissionResponse,
	SessionConfigOption,
	SessionInfo,
	SessionMode,
	SessionModeState,
	SessionNotification,
	SessionStartResponse,
	SessionUpdate,
} from './types';

// --- ACP 协议类型定义（从 @agentclientprotocol/sdk 提取） ---

// ACP 方法常量
const AGENT_METHODS = {
	initialize: 'initialize',
	session_new: 'session/new',
	session_load: 'session/load',
	session_prompt: 'session/prompt',
	session_cancel: 'session/cancel',
	session_set_mode: 'session/set_mode',
	session_set_config_option: 'session/set_config_option',
	session_list: 'session/list',
} as const;

const CLIENT_METHODS = {
	session_update: 'session/update',
	session_request_permission: 'session/request_permission',
	fs_read_text_file: 'fs/read_text_file',
	fs_write_text_file: 'fs/write_text_file',
	terminal_create: 'terminal/create',
	terminal_output: 'terminal/output',
	terminal_wait_for_exit: 'terminal/wait_for_exit',
	terminal_kill: 'terminal/kill',
	terminal_release: 'terminal/release',
} as const;

// zMcpServerStdio 要求 args 和 env 必须为数组（非 optional）
function normalizeMcpServers(
	servers: McpServerEntry[],
): { name: string; command: string; args: string[]; env: { name: string; value: string }[] }[] {
	return servers.map((s) => ({
		name: s.name,
		command: s.command,
		args: s.args ?? [],
		env: s.env ?? [],
	}));
}

// --- 终端管理 ---

interface ManagedTerminal {
	processId: number;
	output: string;
	exitCode: number | null;
	exited: boolean;
	exitPromise: Promise<void>;
	exitResolve: () => void;
}

// --- ACP Client Handler ---

export class ACPClientHandler {
	private renderer: Renderer;
	private options: CliOptions;
	private terminals = new Map<string, ManagedTerminal>();
	private nextTerminalId = 1;
	private permissionHandler: ((params: RequestPermissionRequest) => Promise<RequestPermissionResponse>) | null = null;

	constructor(renderer: Renderer, options: CliOptions) {
		this.renderer = renderer;
		this.options = options;
	}

	setPermissionHandler(
		handler: ((params: RequestPermissionRequest) => Promise<RequestPermissionResponse>) | null,
	): void {
		this.permissionHandler = handler;
	}

	async handleRequest(method: string, params: any): Promise<unknown> {
		switch (method) {
			case CLIENT_METHODS.session_request_permission:
				return this.requestPermission(params);
			case CLIENT_METHODS.fs_read_text_file:
				return this.readTextFile(params);
			case CLIENT_METHODS.fs_write_text_file:
				return this.writeTextFile(params);
			case CLIENT_METHODS.terminal_create:
				return this.createTerminal(params);
			case CLIENT_METHODS.terminal_output:
				return this.terminalOutput(params);
			case CLIENT_METHODS.terminal_wait_for_exit:
				return this.waitForTerminalExit(params);
			case CLIENT_METHODS.terminal_kill:
				return this.killTerminal(params);
			case CLIENT_METHODS.terminal_release:
				return this.releaseTerminal(params);
			default:
				throw { code: -32601, message: `Method not found: ${method}` };
		}
	}

	handleNotification(method: string, params: any): void {
		switch (method) {
			case CLIENT_METHODS.session_update:
				this.renderer.renderSessionUpdate(params as SessionNotification);
				break;
		}
	}

	private async requestPermission(params: RequestPermissionRequest): Promise<RequestPermissionResponse> {
		if (this.permissionHandler) {
			return this.permissionHandler(params);
		}

		const { permission } = this.options;

		if (permission === 'auto-approve') {
			const allow = params.options.find((o) => o.kind.startsWith('allow'));
			return {
				outcome: {
					outcome: 'selected',
					optionId: allow?.optionId ?? params.options[0]!.optionId,
				},
			};
		}

		if (permission === 'deny-all') {
			const reject = params.options.find((o) => o.kind.startsWith('reject'));
			return {
				outcome: {
					outcome: 'selected',
					optionId: reject?.optionId ?? params.options[0]!.optionId,
				},
			};
		}

		// 交互确认模式
		return this.promptForPermission(params);
	}

	private promptForPermission(params: RequestPermissionRequest): Promise<RequestPermissionResponse> {
		return new Promise((resolve) => {
			const toolCall = params.toolCall;
			const writeStderr = UE.ProcessIOHelper.WriteStderr;

			writeStderr('\n');
			writeStderr(`[Permission Required] ${toolCall.title ?? toolCall.toolCallId}\n`);

			if (toolCall.rawInput) {
				writeStderr(`  Input: ${JSON.stringify(toolCall.rawInput)}\n`);
			}

			for (let i = 0; i < params.options.length; i++) {
				const opt = params.options[i]!;
				writeStderr(`  ${i + 1}) ${opt.name} (${opt.kind})\n`);
			}

			writeStderr('Choice [1]: ');

			const poll = () => {
				const line = UE.ProcessIOHelper.ReadStdinLine();
				if (line !== '') {
					const idx = line.trim() === '' ? 0 : parseInt(line, 10) - 1;
					const selected = params.options[idx];
					if (!selected) {
						writeStderr('Invalid choice, try again.\n');
						writeStderr('Choice [1]: ');
						setTimeout(poll, 50);
						return;
					}
					resolve({
						outcome: {
							outcome: 'selected',
							optionId: selected.optionId,
						},
					});
				} else {
					setTimeout(poll, 50);
				}
			};

			poll();
		});
	}

	private async readTextFile(params: { path: string }): Promise<{ content: string }> {
		const filePath = this.resolveFilePath(params.path);
		const existsResult = await new Promise<UE.AsyncFileResult>((resolve) => {
			const r = UE.ProcessIOHelper.FileExists(filePath);
			r.OnComplete.Add(() => resolve(r));
		});
		if (!existsResult.bSuccess) {
			throw { code: -32002, message: `File not found: ${params.path}` };
		}
		const readResult = await new Promise<UE.AsyncFileResult>((resolve) => {
			const r = UE.ProcessIOHelper.ReadTextFile(filePath);
			r.OnComplete.Add(() => resolve(r));
		});
		return { content: readResult.Content };
	}

	private async writeTextFile(params: { path: string; content: string }): Promise<Record<string, never>> {
		const filePath = this.resolveFilePath(params.path);
		const writeResult = await new Promise<UE.AsyncFileResult>((resolve) => {
			const r = UE.ProcessIOHelper.WriteTextFile(filePath, params.content);
			r.OnComplete.Add(() => resolve(r));
		});
		if (!writeResult.bSuccess) {
			throw { code: -32000, message: `Failed to write file: ${params.path}` };
		}
		if (this.renderer.verbose) {
			UE.ProcessIOHelper.WriteStderr(`[File written] ${filePath} (${params.content.length} bytes)\n`);
		}
		return {};
	}

	private async createTerminal(params: {
		command: string;
		args?: string[];
		cwd?: string;
		env?: { name: string; value: string }[];
	}): Promise<{ terminalId: string }> {
		const id = `term_${this.nextTerminalId++}`;
		const args = params.args ?? [];
		const fullArgs = [params.command, ...args].join(' ');
		const cwd = params.cwd ?? this.options.workspace;

		const processId = UE.JsRunHelper.SpawnProcess('cmd', `/c ${fullArgs}`, cwd);
		if (processId < 0) {
			throw { code: -32000, message: 'Failed to spawn terminal process' };
		}

		let exitResolve!: () => void;
		const exitPromise = new Promise<void>((r) => {
			exitResolve = r;
		});

		const terminal: ManagedTerminal = {
			processId,
			output: '',
			exitCode: null,
			exited: false,
			exitPromise,
			exitResolve,
		};

		this.terminals.set(id, terminal);

		// 轮询进程状态
		const pollExit = () => {
			if (terminal.exited) return;
			if (!UE.JsRunHelper.IsProcessRunning(terminal.processId)) {
				terminal.exited = true;
				terminal.exitCode = 0;
				terminal.exitResolve();
			} else {
				setTimeout(pollExit, 100);
			}
		};
		setTimeout(pollExit, 100);

		return { terminalId: id };
	}

	private async terminalOutput(params: { terminalId: string }): Promise<{
		output: string;
		truncated: boolean;
		exitStatus?: { exitCode: number | null; signal: string | null };
	}> {
		const terminal = this.terminals.get(params.terminalId);
		if (!terminal) throw { code: -32002, message: `Terminal not found: ${params.terminalId}` };

		const result: any = {
			output: terminal.output,
			truncated: false,
		};
		if (terminal.exited) {
			result.exitStatus = {
				exitCode: terminal.exitCode,
				signal: null,
			};
		}
		return result;
	}

	private async waitForTerminalExit(params: { terminalId: string }): Promise<{
		exitCode: number | null;
		signal: string | null;
	}> {
		const terminal = this.terminals.get(params.terminalId);
		if (!terminal) throw { code: -32002, message: `Terminal not found: ${params.terminalId}` };

		await terminal.exitPromise;
		return {
			exitCode: terminal.exitCode,
			signal: null,
		};
	}

	private async killTerminal(params: { terminalId: string }): Promise<Record<string, never>> {
		const terminal = this.terminals.get(params.terminalId);
		if (!terminal) throw { code: -32002, message: `Terminal not found: ${params.terminalId}` };

		if (!terminal.exited) {
			UE.JsRunHelper.KillProcess(terminal.processId);
			terminal.exited = true;
			terminal.exitCode = -1;
			terminal.exitResolve();
		}
		return {};
	}

	private async releaseTerminal(params: { terminalId: string }): Promise<Record<string, never>> {
		const terminal = this.terminals.get(params.terminalId);
		if (!terminal) return {};

		if (!terminal.exited) {
			UE.JsRunHelper.KillProcess(terminal.processId);
		}
		this.terminals.delete(params.terminalId);
		return {};
	}

	cleanup(): void {
		for (const [, terminal] of this.terminals) {
			if (!terminal.exited) {
				UE.JsRunHelper.KillProcess(terminal.processId);
			}
		}
		this.terminals.clear();
	}

	private resolveFilePath(filePath: string): string {
		// 简单路径判断
		if (filePath.startsWith('/') || /^[A-Za-z]:/.test(filePath)) {
			return filePath;
		}
		if (filePath.startsWith('file://')) {
			return filePath.replace('file://', '');
		}
		return this.options.workspace + '/' + filePath;
	}
}

// --- ACP Client ---

export class ACPClient {
	private connection: JsonRpcConnection | null = null;
	private handler: ACPClientHandler;
	private renderer: Renderer;
	private options: CliOptions;
	private mcpServers: McpServerEntry[] = [];

	sessionId: string | null = null;
	initResult: InitializeResponse | null = null;
	configOptions: SessionConfigOption[] = [];
	modes: SessionModeState | null = null;
	sessionInfo: SessionInfo | null = null;

	constructor(renderer: Renderer, options: CliOptions) {
		this.renderer = renderer;
		this.options = options;
		this.handler = new ACPClientHandler(renderer, options);
	}

	getHandler(): ACPClientHandler {
		return this.handler;
	}

	/**
	 * 注入 MCP server 列表，发送 `session/new`/`session/load`/`session/list` 时一并下发。
	 * editor 在 `controller.startSession()` 之前调用，把内置 ue-editor 与项目级配置合并后传入。
	 * 传空数组（默认）即"无 MCP"。
	 */
	setMcpServers(servers: McpServerEntry[]): void {
		this.mcpServers = servers ?? [];
	}

	getMcpServers(): McpServerEntry[] {
		return this.mcpServers;
	}

	async connect(): Promise<void> {
		const { command, args, workspace } = this.options;

		// 组装完整命令参数
		const allArgs = [...args].join(' ');
		const fullCommand = allArgs
			? `${command} --workspace ${workspace} ${allArgs}`
			: `${command} --workspace ${workspace}`;

		// Windows 上 npx/node 等命令为 .cmd 脚本，需通过 cmd /c 执行
		const transport = spawnAcpServer({ executable: 'cmd', args: `/c ${fullCommand}`, workspace });

		// 创建 JSON-RPC 连接
		this.connection = new JsonRpcConnection(transport);

		// 注册协议消息观察
		this.connection.onMessage((direction, msg) => {
			this.renderer.renderProtocolMessage(direction, msg as any);
		});

		// 注册 handler
		this.connection.onRequest((method, params) => this.handler.handleRequest(method, params));
		this.connection.onNotification((method, params) => this.handler.handleNotification(method, params));
	}

	async initialize(): Promise<InitializeResponse> {
		if (!this.connection) throw new Error('Not connected');

		const result = await this.connection.sendRequest<InitializeResponse>(AGENT_METHODS.initialize, {
			protocolVersion: PROTOCOL_VERSION,
			clientInfo: {
				name: 'universe-agent-acp-client',
				version: '0.0.0',
			},
			clientCapabilities: {
				fs: { readTextFile: true, writeTextFile: true },
				terminal: true,
			},
		});

		this.initResult = result;
		return result;
	}

	async newSession(): Promise<SessionStartResponse> {
		if (!this.connection) throw new Error('Not connected');

		const result = await this.connection.sendRequest<SessionStartResponse>(AGENT_METHODS.session_new, {
			cwd: this.options.workspace,
			mcpServers: normalizeMcpServers(this.mcpServers),
		});

		this.applySessionStartResponse(result);
		return result;
	}

	async loadSession(sessionId: string): Promise<SessionStartResponse> {
		if (!this.connection) throw new Error('Not connected');

		const result = await this.connection.sendRequest<SessionStartResponse>(AGENT_METHODS.session_load, {
			sessionId,
			cwd: this.options.workspace,
			mcpServers: normalizeMcpServers(this.mcpServers),
		});

		this.applySessionStartResponse(result);
		return result;
	}

	async listSessions(cursor?: string): Promise<ListSessionsResponse> {
		if (!this.connection) throw new Error('Not connected');

		return this.connection.sendRequest<ListSessionsResponse>(AGENT_METHODS.session_list, {
			cursor,
			cwd: this.options.workspace,
			mcpServers: normalizeMcpServers(this.mcpServers),
		});
	}

	async prompt(text: string): Promise<{ stopReason: string }> {
		if (!this.connection || !this.sessionId) {
			throw new Error('No active session');
		}

		const result = await this.connection.sendRequest<{ stopReason: string }>(AGENT_METHODS.session_prompt, {
			sessionId: this.sessionId,
			prompt: [{ type: 'text', text }],
		});

		return { stopReason: result.stopReason };
	}

	async cancel(): Promise<void> {
		if (!this.connection || !this.sessionId) return;
		this.connection.sendNotification(AGENT_METHODS.session_cancel, { sessionId: this.sessionId });
	}

	async setMode(mode: string): Promise<void> {
		if (!this.connection || !this.sessionId) {
			throw new Error('No active session');
		}

		await this.connection.sendRequest(AGENT_METHODS.session_set_mode, {
			sessionId: this.sessionId,
			mode,
		});
	}

	async setConfigOption(optionId: string, valueId: string | boolean): Promise<SessionConfigOption[]> {
		if (!this.connection || !this.sessionId) {
			throw new Error('No active session');
		}

		const params =
			typeof valueId === 'boolean'
				? { sessionId: this.sessionId, optionId, value: valueId }
				: { sessionId: this.sessionId, optionId, valueId };
		const result = await this.connection.sendRequest<{ configOptions?: SessionConfigOption[] }>(
			AGENT_METHODS.session_set_config_option,
			params,
		);
		this.configOptions = result.configOptions ?? this.configOptions;
		return this.configOptions;
	}

	async disconnect(): Promise<void> {
		this.handler.cleanup();
		this.connection?.dispose();
		this.connection = null;
		this.sessionId = null;
		this.configOptions = [];
		this.modes = null;
		this.sessionInfo = null;
	}

	get closed(): Promise<void> | undefined {
		return this.connection?.closed;
	}

	private applySessionStartResponse(result: SessionStartResponse): void {
		this.sessionId = result.sessionId;
		this.configOptions = result.configOptions ?? [];
		this.modes = result.modes ?? null;
		this.sessionInfo = result.sessionInfo ?? { sessionId: result.sessionId };
	}
}
