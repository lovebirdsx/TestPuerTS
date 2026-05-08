import type {
	AcpClient,
	AcpClientOptions,
	AcpConnectionStatus,
	AcpPermissionStrategy,
	JsonRpcMessage,
	PendingPermissionRequest,
	SessionConfigOption,
	SessionInfo,
	SessionModeState,
} from '@universe-agent/acp-client-ue';
import type { StateStorage } from 'zustand/middleware';

export type MessageRole = 'user' | 'agent' | 'thought' | 'system' | 'error';
export type InspectorTab = 'plan' | 'tools' | 'protocol' | 'state' | 'commands';

/** SessionPicker 列表项（来自服务端 session/list）。 */
export interface SessionListEntry {
	sessionId: string;
	title?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface ChatMessage {
	id: number;
	role: MessageRole;
	text: string;
}

export interface ToolRecord {
	id: string;
	title: string;
	kind?: string;
	status?: string | null;
	rawInput?: unknown;
	rawOutput?: unknown;
	content?: unknown;
}

export interface PlanEntry {
	content: string;
	status: string;
	priority: string;
}

export interface ProtocolEntry {
	id: number;
	direction: 'send' | 'recv';
	message: JsonRpcMessage;
}

export interface CommandEntry {
	name: string;
	description?: string;
}

export interface UsageInfo {
	size: number;
	used: number;
}

export interface PersistedConfig {
	/** 当前选中的连接配置 ID；空字符串表示使用第一个可用连接。 */
	activeConnectionId: string;
	startup: {
		autoConnect: boolean;
	};
}

export interface PersistedPolicy {
	permission: AcpPermissionStrategy;
	protocolEnabled: boolean;
}

export interface PersistedInspector {
	activeTab: InspectorTab;
}

/** 实际写入磁盘的子集；与 zustand persist 的 partialize 输出一致。 */
export interface PersistedState {
	config: PersistedConfig;
	policy: PersistedPolicy;
	inspector: PersistedInspector;
}

export type AcpClientFactory = (options: AcpClientOptions) => AcpClient;

export interface AcpPanelStoreOptions {
	/** 测试可注入 Mock；不传则使用真实 AcpClient 工厂。 */
	clientFactory?: AcpClientFactory;
	/** 持久化文件名，默认 `acp-panel`；测试可换成 in-memory storage 隔离。 */
	persistName?: string;
	/** 测试用 in-memory 替代 ueStorage。 */
	storage?: StateStorage;
}

export type {
	AcpClient,
	AcpClientOptions,
	AcpConnectionStatus,
	AcpPermissionStrategy,
	JsonRpcMessage,
	PendingPermissionRequest,
	SessionConfigOption,
	SessionInfo,
	SessionModeState,
};
