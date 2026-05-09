import type { JsonRpcMessage } from './jsonrpc';
import { ACPClient, type AcpTransportFactory } from './client';
import { Renderer } from './renderer';
import type {
	InitializeResponse,
	ListSessionsResponse,
	McpServerEntry,
	RequestPermissionRequest,
	RequestPermissionResponse,
	SessionConfigOption,
	SessionInfo,
	SessionInfoUpdate,
	SessionModeState,
	SessionNotification,
	SessionStartResponse,
	SessionUpdate,
} from './types';
import type { CliOptions } from './cli';

export type AcpPermissionStrategy = 'interactive' | 'auto-approve' | 'deny-all';
export type AcpConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface AcpUiControllerOptions {
	command: string;
	args?: string[];
	workspace: string;
	protocol?: boolean;
	verbose?: boolean;
	permission?: AcpPermissionStrategy;
	mode?: string;
	session?: string;
	/** 初始 MCP server 列表；后续可通过 `setMcpServers()` 替换。 */
	mcpServers?: McpServerEntry[];
}

export interface PendingPermissionRequest {
	id: number;
	request: RequestPermissionRequest;
	resolve(optionId: string): void;
	cancel(): void;
}

export interface AcpUiState {
	status: AcpConnectionStatus;
	agentName: string;
	agentVersion: string;
	sessionId: string | null;
	permission: AcpPermissionStrategy;
	configOptions: SessionConfigOption[];
	modes: SessionModeState | null;
	sessionInfo: SessionInfo | null;
	isPrompting: boolean;
	error: string | null;
}

export type AcpUiEvent =
	| { type: 'status_changed'; status: AcpConnectionStatus; message?: string }
	| { type: 'initialized'; result: InitializeResponse }
	| { type: 'session_changed'; session: SessionStartResponse }
	| { type: 'session_listed'; result: ListSessionsResponse }
	| { type: 'message_chunk'; sessionId: string; role: 'user' | 'agent'; text: string }
	| { type: 'thought_chunk'; sessionId: string; text: string }
	| {
			type: 'plan_updated';
			sessionId: string;
			entries: { content: string; status: string; priority: string }[];
	  }
	| {
			type: 'tool_call_updated';
			sessionId: string;
			toolCallId: string;
			title: string;
			kind?: string;
			status?: string | null;
			rawInput?: unknown;
			rawOutput?: unknown;
			content?: unknown;
	  }
	| {
			type: 'commands_updated';
			sessionId: string;
			commands: { name: string; description?: string }[];
	  }
	| { type: 'mode_updated'; sessionId: string; currentModeId: string }
	| { type: 'config_options_updated'; sessionId: string; configOptions: SessionConfigOption[] }
	| { type: 'session_info_updated'; sessionId: string; sessionInfo: SessionInfoUpdate }
	| { type: 'usage_updated'; sessionId: string; size: number; used: number }
	| { type: 'protocol_message'; direction: 'send' | 'recv'; message: JsonRpcMessage }
	| { type: 'permission_requested'; permission: PendingPermissionRequest }
	| { type: 'prompt_finished'; stopReason: string }
	| { type: 'error'; message: string };

type Listener = (event: AcpUiEvent) => void;

class AcpEventRenderer extends Renderer {
	private emitEvent: Listener;

	constructor(emitEvent: Listener, options: { protocol: boolean; verbose: boolean }) {
		super(options);
		this.emitEvent = emitEvent;
	}

	override renderProtocolMessage(direction: 'send' | 'recv', msg: JsonRpcMessage): void {
		if (!this.protocol) return;
		this.emitEvent({ type: 'protocol_message', direction, message: msg });
	}

	override renderSessionUpdate(notification: SessionNotification): void {
		const update: SessionUpdate = notification.update;
		const sessionId = notification.sessionId;

		switch (update.sessionUpdate) {
			case 'agent_message_chunk':
				this.emitContentChunk(sessionId, 'agent', update.content);
				break;
			case 'agent_thought_chunk':
				this.emitThought(sessionId, update.content);
				break;
			case 'user_message_chunk':
				this.emitContentChunk(sessionId, 'user', update.content);
				break;
			case 'tool_call':
				this.emitEvent({
					type: 'tool_call_updated',
					sessionId,
					toolCallId: update.toolCallId,
					title: update.title,
					kind: update.kind,
					status: update.status,
					rawInput: update.rawInput,
				});
				break;
			case 'tool_call_update':
				this.emitEvent({
					type: 'tool_call_updated',
					sessionId,
					toolCallId: update.toolCallId,
					title: update.title ?? update.toolCallId,
					status: update.status,
					rawOutput: update.rawOutput,
					content: update.content,
				});
				break;
			case 'plan':
				this.emitEvent({ type: 'plan_updated', sessionId, entries: update.entries });
				break;
			case 'available_commands_update':
				this.emitEvent({ type: 'commands_updated', sessionId, commands: update.availableCommands });
				break;
			case 'current_mode_update':
				this.emitEvent({ type: 'mode_updated', sessionId, currentModeId: update.currentModeId });
				break;
			case 'config_option_update':
				this.emitEvent({
					type: 'config_options_updated',
					sessionId,
					configOptions: update.configOptions,
				});
				break;
			case 'session_info_update':
				this.emitEvent({
					type: 'session_info_updated',
					sessionId,
					sessionInfo: update,
				});
				break;
			case 'usage_update':
				this.emitEvent({ type: 'usage_updated', sessionId, size: update.size, used: update.used });
				break;
			default:
				if (this.verbose) {
					this.emitEvent({
						type: 'error',
						message: `Unknown session update: ${(update as { sessionUpdate: string }).sessionUpdate}`,
					});
				}
		}
	}

	override ensureNewline(): void {}

	private emitContentChunk(
		sessionId: string,
		role: 'user' | 'agent',
		content: { type: string; text?: string },
	): void {
		if (content.type === 'text' && content.text) {
			this.emitEvent({ type: 'message_chunk', sessionId, role, text: content.text });
		}
	}

	private emitThought(sessionId: string, content: { type: string; text?: string }): void {
		if (content.type === 'text' && content.text) {
			this.emitEvent({ type: 'thought_chunk', sessionId, text: content.text });
		}
	}
}

export class AcpUiController {
	private options: AcpUiControllerOptions;
	private client: ACPClient | null = null;
	private renderer: AcpEventRenderer;
	private listeners = new Set<Listener>();
	private state: AcpUiState;
	private nextPermissionId = 1;
	private pendingPermissions = new Map<number, { resolve: (response: RequestPermissionResponse) => void }>();
	private mcpServers: McpServerEntry[] = [];
	private transportFactory: AcpTransportFactory | undefined;

	constructor(options: AcpUiControllerOptions, transportFactory?: AcpTransportFactory) {
		this.options = {
			...options,
			args: options.args ?? [],
			protocol: options.protocol ?? false,
			verbose: options.verbose ?? false,
			permission: options.permission ?? 'interactive',
		};
		this.state = {
			status: 'disconnected',
			agentName: '',
			agentVersion: '',
			sessionId: null,
			permission: this.options.permission ?? 'interactive',
			configOptions: [],
			modes: null,
			sessionInfo: null,
			isPrompting: false,
			error: null,
		};
		this.renderer = new AcpEventRenderer((event) => this.handleRendererEvent(event), {
			protocol: this.options.protocol ?? false,
			verbose: this.options.verbose ?? false,
		});
		this.mcpServers = options.mcpServers ?? [];
		this.transportFactory = transportFactory;
	}

	/**
	 * 替换 MCP server 列表，下次发起 `newSession`/`loadSession`/`listSessions` 时生效。
	 * 已建立的会话不会被重置；如需让 agent 重新加载 MCP，调用方需 disconnect → connect → newSession。
	 */
	setMcpServers(servers: McpServerEntry[]): void {
		this.mcpServers = servers ?? [];
		this.client?.setMcpServers(this.mcpServers);
	}

	getMcpServers(): McpServerEntry[] {
		return [...this.mcpServers];
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	getState(): AcpUiState {
		return { ...this.state };
	}

	setPermissionStrategy(permission: AcpPermissionStrategy): void {
		this.options.permission = permission;
		this.state = { ...this.state, permission };
	}

	setProtocolEnabled(enabled: boolean): void {
		this.options.protocol = enabled;
		this.renderer.protocol = enabled;
	}

	async connect(): Promise<void> {
		if (this.client) {
			await this.disconnect();
		}

		this.setStatus('connecting');
		this.state = { ...this.state, error: null };
		const client = this.transportFactory
			? new ACPClient(this.renderer, this.toCliOptions(), this.transportFactory)
			: new ACPClient(this.renderer, this.toCliOptions());
		client.getHandler().setPermissionHandler((params) => this.resolvePermission(params));
		client.setMcpServers(this.mcpServers);
		this.client = client;

		try {
			await client.connect();
			const init = await client.initialize();
			this.state = {
				...this.state,
				status: 'connected',
				agentName: init.agentInfo?.name ?? 'agent',
				agentVersion: init.agentInfo?.version ?? '',
			};
			this.emit({ type: 'initialized', result: init });
			this.emit({ type: 'status_changed', status: 'connected' });
		} catch (err) {
			await this.disconnect();
			this.fail(err);
		}
	}

	async disconnect(): Promise<void> {
		this.cancelPendingPermissions();
		await this.client?.disconnect();
		this.client = null;
		this.state = {
			...this.state,
			status: 'disconnected',
			sessionId: null,
			isPrompting: false,
			configOptions: [],
			modes: null,
			sessionInfo: null,
		};
		this.emit({ type: 'status_changed', status: 'disconnected' });
	}

	async newSession(): Promise<void> {
		const session = await this.requireClient().newSession();
		this.applySession(session);
	}

	async loadSession(sessionId: string): Promise<void> {
		const session = await this.requireClient().loadSession(sessionId);
		this.applySession(session);
	}

	async listSessions(): Promise<ListSessionsResponse> {
		const result = await this.requireClient().listSessions();
		this.emit({ type: 'session_listed', result });
		return result;
	}

	async sendPrompt(text: string): Promise<void> {
		const prompt = text.trim();
		if (!prompt) return;

		this.state = { ...this.state, isPrompting: true };
		try {
			const result = await this.requireClient().prompt(prompt);
			this.emit({ type: 'prompt_finished', stopReason: result.stopReason });
		} catch (err) {
			this.emit({ type: 'error', message: errorMessage(err) });
		} finally {
			this.state = { ...this.state, isPrompting: false };
		}
	}

	async cancel(): Promise<void> {
		this.cancelPendingPermissions();
		await this.client?.cancel();
		this.state = { ...this.state, isPrompting: false };
	}

	async setMode(mode: string): Promise<void> {
		await this.requireClient().setMode(mode);
		this.state = {
			...this.state,
			modes: this.state.modes ? { ...this.state.modes, currentModeId: mode } : this.state.modes,
		};
		const sessionId = this.state.sessionId;
		if (sessionId) this.emit({ type: 'mode_updated', sessionId, currentModeId: mode });
	}

	async setConfigOption(optionId: string, valueId: string | boolean): Promise<void> {
		const configOptions = await this.requireClient().setConfigOption(optionId, valueId);
		this.state = { ...this.state, configOptions };
		const sessionId = this.state.sessionId;
		if (sessionId) this.emit({ type: 'config_options_updated', sessionId, configOptions });
	}

	private applySession(session: SessionStartResponse): void {
		this.state = {
			...this.state,
			sessionId: session.sessionId,
			configOptions: session.configOptions ?? [],
			modes: session.modes ?? null,
			sessionInfo: { sessionId: session.sessionId, cwd: this.options.workspace },
		};
		this.emit({ type: 'session_changed', session });
	}

	private resolvePermission(params: RequestPermissionRequest): Promise<RequestPermissionResponse> {
		const permission = this.state.permission;
		if (permission === 'auto-approve') {
			const allow = params.options.find((o) => o.kind.startsWith('allow'));
			return Promise.resolve(selectedPermission(allow?.optionId ?? params.options[0]!.optionId));
		}

		if (permission === 'deny-all') {
			const reject = params.options.find((o) => o.kind.startsWith('reject'));
			return Promise.resolve(selectedPermission(reject?.optionId ?? params.options[0]!.optionId));
		}

		return new Promise((resolve) => {
			const id = this.nextPermissionId++;
			this.pendingPermissions.set(id, { resolve });
			this.emit({
				type: 'permission_requested',
				permission: {
					id,
					request: params,
					resolve: (optionId: string) => this.resolvePendingPermission(id, selectedPermission(optionId)),
					cancel: () =>
						this.resolvePendingPermission(id, {
							outcome: { outcome: 'cancelled' },
						} as unknown as RequestPermissionResponse),
				},
			});
		});
	}

	private resolvePendingPermission(id: number, response: RequestPermissionResponse): void {
		const pending = this.pendingPermissions.get(id);
		if (!pending) return;
		this.pendingPermissions.delete(id);
		pending.resolve(response);
	}

	private cancelPendingPermissions(): void {
		for (const [id] of this.pendingPermissions) {
			this.resolvePendingPermission(id, {
				outcome: { outcome: 'cancelled' },
			} as unknown as RequestPermissionResponse);
		}
	}

	private handleRendererEvent(event: AcpUiEvent): void {
		switch (event.type) {
			case 'config_options_updated':
				this.state = { ...this.state, configOptions: event.configOptions };
				break;
			case 'mode_updated':
				this.state = {
					...this.state,
					modes: this.state.modes
						? { ...this.state.modes, currentModeId: event.currentModeId }
						: this.state.modes,
				};
				break;
			case 'session_info_updated':
				if (this.state.sessionInfo) {
					this.state = {
						...this.state,
						sessionInfo: { ...this.state.sessionInfo, ...event.sessionInfo },
					};
				}
				break;
		}
		this.emit(event);
	}

	private requireClient(): ACPClient {
		if (!this.client) {
			throw new Error('ACP client is not connected');
		}
		return this.client;
	}

	private setStatus(status: AcpConnectionStatus, message?: string): void {
		this.state = { ...this.state, status };
		this.emit({ type: 'status_changed', status, message });
	}

	private fail(err: unknown): never {
		const message = errorMessage(err);
		this.state = { ...this.state, status: 'error', error: message };
		this.emit({ type: 'error', message });
		this.emit({ type: 'status_changed', status: 'error', message });
		throw err instanceof Error ? err : new Error(message);
	}

	private emit(event: AcpUiEvent): void {
		for (const listener of this.listeners) {
			listener(event);
		}
	}

	private toCliOptions(): CliOptions {
		return {
			command: this.options.command,
			args: this.options.args ?? [],
			workspace: this.options.workspace,
			protocol: this.options.protocol ?? false,
			verbose: this.options.verbose ?? false,
			permission: this.state.permission,
			mode: this.options.mode,
			session: this.options.session,
		};
	}
}

function selectedPermission(optionId: string): RequestPermissionResponse {
	return {
		outcome: {
			outcome: 'selected',
			optionId,
		},
	};
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}
