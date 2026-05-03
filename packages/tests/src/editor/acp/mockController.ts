import type {
	AcpPermissionStrategy,
	AcpUiController,
	AcpUiControllerOptions,
	AcpUiEvent,
	AcpUiState,
	ListSessionsResponse,
	McpServerEntry,
} from '@universe-agent/acp-client-ue';

type Listener = (event: AcpUiEvent) => void;

// 替代真 AcpUiController 的极简 mock：仅记录调用、广播事件，不做任何真实 IO。
// 通过 `as unknown as AcpUiController` 在 panel 测试里塞进 controllerFactory。
export class MockAcpUiController {
	public readonly options: AcpUiControllerOptions;

	public connectCalls = 0;
	public disconnectCalls = 0;
	public newSessionCalls = 0;
	public loadSessionCalls: string[] = [];
	public sendPromptCalls: string[] = [];
	public cancelCalls = 0;
	public lastPermissionStrategy?: AcpPermissionStrategy;
	public lastProtocolEnabled?: boolean;
	public lastMode?: string;
	public lastConfigOption?: { optionId: string; value: string | boolean };
	public mcpServersCalls: McpServerEntry[][] = [];

	private listeners = new Set<Listener>();
	private state: AcpUiState;

	// 测试可重写：让 connect/sendPrompt/newSession 等抛错走错误分支
	public connectImpl: () => Promise<void> = async () => {};
	public newSessionImpl: () => Promise<void> = async () => {};
	public loadSessionImpl: (id: string) => Promise<void> = async () => {};
	public sendPromptImpl: (text: string) => Promise<void> = async () => {};
	public listSessionsImpl: () => Promise<ListSessionsResponse> = async () =>
		({ sessions: [] }) as unknown as ListSessionsResponse;

	constructor(options: AcpUiControllerOptions) {
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

	// 手动向所有订阅者广播事件，模拟真 controller 的事件流
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

	async newSession(): Promise<void> {
		this.newSessionCalls++;
		await this.newSessionImpl();
	}

	async loadSession(sessionId: string): Promise<void> {
		this.loadSessionCalls.push(sessionId);
		await this.loadSessionImpl(sessionId);
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

// 极简 MockMcpManager：buildSessionMcpList 直接返回空 servers，不触发任何 IO。
// 通过 `as unknown as McpManager` 在 panel 测试里塞进 mcpManagerFactory。
export class MockMcpManager {
	public buildCalls: string[] = [];
	public stopCalls: string[] = [];
	public disposeCalls = 0;

	async buildSessionMcpList(sessionId: string): Promise<{
		servers: unknown[];
		warnings: string[];
	}> {
		this.buildCalls.push(sessionId);
		return { servers: [], warnings: [] };
	}

	stopSession(sessionId: string): void {
		this.stopCalls.push(sessionId);
	}

	hasSession(): boolean {
		return false;
	}

	dispose(): void {
		this.disposeCalls++;
	}
}

// 类型断言辅助：把 MockMcpManager 当作真 McpManager 注入 mcpManagerFactory
export function asMcpManager<T>(mock: MockMcpManager): T {
	return mock as unknown as T;
}

// 类型断言辅助：把 mock 当作真 controller 注入 controllerFactory
export function asController(mock: MockAcpUiController): AcpUiController {
	return mock as unknown as AcpUiController;
}
