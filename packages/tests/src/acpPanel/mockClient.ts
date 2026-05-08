import type {
	AcpClient,
	AcpClientOptions,
	AcpPermissionStrategy,
	AcpUiController,
	AcpUiEvent,
	AcpUiState,
	ListSessionsResponse,
	McpServerEntry,
} from '@universe-agent/acp-client-ue';

type Listener = (event: AcpUiEvent) => void;

// 替代真 AcpUiController 的极简 mock：仅记录调用、广播事件，不做任何真实 IO。
// 通过 `asController()` 在测试中暴露给 MockAcpClient.controller。
export class MockAcpUiController {
	public readonly options: AcpClientOptions;

	public connectCalls = 0;
	public disconnectCalls = 0;
	public sendPromptCalls: string[] = [];
	public cancelCalls = 0;
	public lastPermissionStrategy?: AcpPermissionStrategy;
	public lastProtocolEnabled?: boolean;
	public lastMode?: string;
	public lastConfigOption?: { optionId: string; value: string | boolean };
	public mcpServersCalls: McpServerEntry[][] = [];

	private listeners = new Set<Listener>();
	private state: AcpUiState;

	// 测试可重写：让 connect/sendPrompt 等抛错走错误分支
	public connectImpl: () => Promise<void> = async () => {};
	public sendPromptImpl: (text: string) => Promise<void> = async () => {};
	public listSessionsImpl: () => Promise<ListSessionsResponse> = async () =>
		({ sessions: [] }) as unknown as ListSessionsResponse;

	constructor(options: AcpClientOptions) {
		this.options = options;
		this.state = {
			status: 'disconnected',
			agentName: '',
			agentVersion: '',
			sessionId: null,
			permission: options.permission ?? 'interactive',
			configOptions: [],
			modes: null,
			sessionInfo: null,
			isPrompting: false,
			error: null,
		};
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	getState(): AcpUiState {
		return { ...this.state };
	}

	emit(event: AcpUiEvent): void {
		for (const l of this.listeners) l(event);
	}

	async connect(): Promise<void> {
		this.connectCalls++;
		await this.connectImpl();
	}

	async disconnect(): Promise<void> {
		this.disconnectCalls++;
	}

	async listSessions(): Promise<ListSessionsResponse> {
		return this.listSessionsImpl();
	}

	async sendPrompt(text: string): Promise<void> {
		this.sendPromptCalls.push(text);
		await this.sendPromptImpl(text);
	}

	async cancel(): Promise<void> {
		this.cancelCalls++;
	}

	setPermissionStrategy(permission: AcpPermissionStrategy): void {
		this.lastPermissionStrategy = permission;
	}

	setProtocolEnabled(enabled: boolean): void {
		this.lastProtocolEnabled = enabled;
	}

	async setMode(mode: string): Promise<void> {
		this.lastMode = mode;
	}

	async setConfigOption(optionId: string, value: string | boolean): Promise<void> {
		this.lastConfigOption = { optionId, value };
	}

	setMcpServers(servers: McpServerEntry[]): void {
		this.mcpServersCalls.push(servers);
	}
}

/**
 * 替代真 AcpClient facade 的极简 mock：组合一个 MockAcpUiController 作为 controller，
 * newSession/loadSession 直接返回空 warnings；不做任何真实 MCP 接线。
 */
export class MockAcpClient {
	public readonly options: AcpClientOptions;
	public readonly controller: AcpUiController;
	public readonly mockController: MockAcpUiController;

	public connectCalls = 0;
	public disconnectCalls = 0;
	public disposeCalls = 0;
	public newSessionCalls = 0;
	public loadSessionCalls: string[] = [];

	public newSessionImpl: () => Promise<{ warnings: string[] }> = async () => ({ warnings: [] });
	public loadSessionImpl: (id: string) => Promise<{ warnings: string[] }> = async () => ({ warnings: [] });

	constructor(options: AcpClientOptions) {
		this.options = options;
		this.mockController = new MockAcpUiController(options);
		this.controller = this.mockController as unknown as AcpUiController;
	}

	connect(): Promise<void> {
		this.connectCalls++;
		return this.mockController.connect();
	}

	async disconnect(): Promise<void> {
		this.disconnectCalls++;
		await this.mockController.disconnect();
	}

	async dispose(): Promise<void> {
		this.disposeCalls++;
		await this.mockController.disconnect();
	}

	async newSession(): Promise<{ warnings: string[] }> {
		this.newSessionCalls++;
		return this.newSessionImpl();
	}

	async loadSession(sessionId: string): Promise<{ warnings: string[] }> {
		this.loadSessionCalls.push(sessionId);
		return this.loadSessionImpl(sessionId);
	}
}

/** 类型断言辅助：把 mock 当作真 AcpClient 注入 clientFactory。 */
export function asClient(mock: MockAcpClient): AcpClient {
	return mock as unknown as AcpClient;
}
