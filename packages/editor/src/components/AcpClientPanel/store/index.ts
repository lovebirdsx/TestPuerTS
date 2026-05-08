import type { AcpClient, AcpUiEvent } from '@universe-agent/acp-client-ue';
import { create, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type {
	AcpClientFactory,
	AcpConnectionStatus,
	AcpPanelStoreOptions,
	AcpPermissionStrategy,
	ChatMessage,
	CommandEntry,
	InspectorTab,
	MessageRole,
	PendingPermissionRequest,
	PersistedConfig,
	PersistedState,
	PlanEntry,
	ProtocolEntry,
	SessionConfigOption,
	SessionInfo,
	SessionModeState,
	ToolRecord,
	UsageInfo,
} from '../types';
import { type ConnectionProfile, loadConnectionsConfig } from './connectionConfig';
import { ueStorage } from './ueStorage';

// 转出常用类型，方便领域组件按 `'../../store'` 路径就近引用
export type {
	ChatMessage,
	CommandEntry,
	InspectorTab,
	MessageRole,
	PendingPermissionRequest,
	PersistedConfig,
	PersistedState,
	PlanEntry,
	ProtocolEntry,
	SessionConfigOption,
	SessionInfo,
	SessionModeState,
	ToolRecord,
	UsageInfo,
} from '../types';
export type { ConnectionProfile } from './connectionConfig';

const PROTOCOL_LIMIT = 200;
const DEFAULT_COMMAND = 'npx universe-agent-acp';

let nextMessageId = 1;
let nextProtocolId = 1;

const defaultClientFactory: AcpClientFactory = (options) => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { AcpClient } = require('@universe-agent/acp-client-ue') as typeof import('@universe-agent/acp-client-ue');
	return new AcpClient(options);
};

// ──────────────────────────────────────────────────────────────────────────
// 状态形状
// ──────────────────────────────────────────────────────────────────────────

export interface AcpPanelStateData {
	// connection
	client: AcpClient | undefined;
	status: AcpConnectionStatus;
	agentName: string;
	agentVersion: string;
	error: string | undefined;

	// connection profiles (从 acp-connections.json 加载，不持久化)
	connections: ConnectionProfile[];

	// session
	sessionId: string | undefined;
	sessionToLoad: string;
	configOptions: SessionConfigOption[];
	modes: SessionModeState | undefined;
	sessionInfo: SessionInfo | undefined;

	// prompt
	prompt: string;
	isPrompting: boolean;

	// conversation
	messages: ChatMessage[];

	// inspector
	activeTab: InspectorTab;
	plan: PlanEntry[];
	tools: ToolRecord[];
	protocol: ProtocolEntry[];
	commands: CommandEntry[];
	usage: UsageInfo | undefined;

	// permission
	pendingPermission: PendingPermissionRequest | undefined;

	// policy（持久化字段，且 setter 同步到 controller）
	permission: AcpPermissionStrategy;
	protocolEnabled: boolean;

	// config（持久化）
	config: PersistedConfig;
}

export interface AcpPanelActions {
	// connection
	connect: () => void;
	disconnect: () => Promise<void>;

	// session
	setSessionToLoad: (value: string) => void;
	newSession: () => void;
	loadSession: () => void;
	setMode: (mode: string) => void;
	setConfigOption: (id: string, value: string | boolean) => void;

	// prompt
	setPrompt: (value: string) => void;
	sendPrompt: () => void;
	cancel: () => void;

	// conversation
	clearMessages: () => void;

	// inspector
	setActiveTab: (tab: InspectorTab) => void;
	clearProtocol: () => void;

	// permission
	resolvePermission: (optionId: string) => void;
	cancelPermission: () => void;

	// policy
	setPermissionStrategy: (value: AcpPermissionStrategy) => void;
	setProtocolEnabled: (value: boolean) => void;

	// config
	setAutoConnect: (value: boolean) => void;

	// connections（JSON 配置文件中的连接档案）
	setActiveConnectionId: (id: string) => void;
	loadConnections: () => Promise<void>;

	// internal: 由订阅 controller 事件触发；测试可直接调用
	ingestEvent: (event: AcpUiEvent) => void;
}

export type AcpPanelStore = AcpPanelStateData & AcpPanelActions;

// ──────────────────────────────────────────────────────────────────────────
// 默认值
// ──────────────────────────────────────────────────────────────────────────

function defaultConfig(): PersistedConfig {
	return {
		activeConnectionId: '',
		startup: { autoConnect: false },
	};
}

function initialData(): AcpPanelStateData {
	return {
		client: undefined,
		status: 'disconnected',
		agentName: '',
		agentVersion: '',
		error: undefined,

		connections: [],

		sessionId: undefined,
		sessionToLoad: '',
		configOptions: [],
		modes: undefined,
		sessionInfo: undefined,

		prompt: '',
		isPrompting: false,

		messages: [],

		activeTab: 'plan',
		plan: [],
		tools: [],
		protocol: [],
		commands: [],
		usage: undefined,

		pendingPermission: undefined,

		permission: 'interactive',
		protocolEnabled: false,

		config: defaultConfig(),
	};
}

// ──────────────────────────────────────────────────────────────────────────
// 工具（导出供测试）
// ──────────────────────────────────────────────────────────────────────────

export function pushMessage(messages: ChatMessage[], role: MessageRole, text: string): void {
	messages.push({ id: nextMessageId++, role, text });
}

export function appendStream(messages: ChatMessage[], role: MessageRole, text: string): void {
	const last = messages[messages.length - 1];
	if (last && last.role === role) {
		last.text = last.text + text;
		return;
	}
	pushMessage(messages, role, text);
}

export function upsertTool(tools: ToolRecord[], event: Extract<AcpUiEvent, { type: 'tool_call_updated' }>): void {
	const next: ToolRecord = {
		id: event.toolCallId,
		title: event.title,
		kind: event.kind,
		status: event.status,
		rawInput: event.rawInput,
		rawOutput: event.rawOutput,
		content: event.content,
	};
	const index = tools.findIndex((t) => t.id === next.id);
	if (index < 0) {
		tools.push(next);
		return;
	}
	const previous = tools[index]!;
	tools[index] = { ...previous, ...next };
}

export function splitArgs(input: string): string[] {
	return input
		.split(' ')
		.map((part) => part.trim())
		.filter(Boolean);
}

export function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

function resolveWorkspace(workspace: string): string {
	if (workspace !== '') return workspace;
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const ue = require('ue') as typeof import('ue');
	return ue.JsRunHelper.GetProjectDir();
}

// ──────────────────────────────────────────────────────────────────────────
// EventSink：把 controller 事件投影到 store
// ──────────────────────────────────────────────────────────────────────────

export function ingestEvent(s: AcpPanelStateData, event: AcpUiEvent): void {
	switch (event.type) {
		case 'status_changed':
			s.status = event.status;
			if (event.message) s.error = event.message;
			break;
		case 'initialized':
			s.agentName = event.result.agentInfo?.name ?? 'agent';
			s.agentVersion = event.result.agentInfo?.version ?? '';
			break;
		case 'session_changed':
			s.sessionId = event.session.sessionId;
			s.configOptions = event.session.configOptions ?? [];
			s.modes = event.session.modes ?? undefined;
			s.sessionInfo = event.session.sessionInfo ?? { sessionId: event.session.sessionId };
			pushMessage(s.messages, 'system', `Session ready: ${event.session.sessionId}`);
			break;
		case 'message_chunk':
			appendStream(s.messages, event.role, event.text);
			break;
		case 'thought_chunk':
			appendStream(s.messages, 'thought', event.text);
			break;
		case 'plan_updated':
			s.plan = event.entries;
			break;
		case 'tool_call_updated':
			upsertTool(s.tools, event);
			break;
		case 'commands_updated':
			s.commands = event.commands;
			break;
		case 'mode_updated':
			if (s.modes) s.modes.currentModeId = event.currentModeId;
			break;
		case 'config_options_updated':
			s.configOptions = event.configOptions;
			break;
		case 'session_info_updated':
			s.sessionInfo = { ...(s.sessionInfo ?? {}), ...event.sessionInfo };
			break;
		case 'usage_updated':
			s.usage = { size: event.size, used: event.used };
			break;
		case 'protocol_message':
			if (s.protocol.length >= PROTOCOL_LIMIT) s.protocol.shift();
			s.protocol.push({ id: nextProtocolId++, direction: event.direction, message: event.message });
			break;
		case 'permission_requested':
			s.pendingPermission = event.permission;
			break;
		case 'prompt_finished':
			s.isPrompting = false;
			pushMessage(s.messages, 'system', `Stop reason: ${event.stopReason}`);
			break;
		case 'error':
			s.error = event.message;
			s.isPrompting = false;
			pushMessage(s.messages, 'error', event.message);
			break;
		case 'session_listed':
			break;
		default: {
			const _exhaustive: never = event;
			void _exhaustive;
		}
	}
}

// ──────────────────────────────────────────────────────────────────────────
// 订阅 句柄（store 内部用：每个 store 实例对应一个 unsubscribe）
// ──────────────────────────────────────────────────────────────────────────

const subscriptions = new WeakMap<object, () => void>();

// ──────────────────────────────────────────────────────────────────────────
// Slice creator
// ──────────────────────────────────────────────────────────────────────────

const createSlices = (
	options: AcpPanelStoreOptions,
): StateCreator<AcpPanelStore, [['zustand/immer', never]], [], AcpPanelStore> => {
	const clientFactory = options.clientFactory ?? defaultClientFactory;

	return (set, get) => ({
		...initialData(),

		// ── connection ──
		connect: () => {
			const { config, connections, permission, protocolEnabled } = get();
			const profile = connections.find((c) => c.id === config.activeConnectionId) ?? connections[0];
			const client = clientFactory({
				command: profile?.command ?? DEFAULT_COMMAND,
				args: splitArgs(profile?.extraArgs ?? ''),
				workspace: resolveWorkspace(profile?.workspace ?? ''),
				permission,
				protocol: protocolEnabled,
				verbose: true,
			});
			const unsubscribe = client.controller.subscribe((event) => get().ingestEvent(event));
			subscriptions.set(client, unsubscribe);

			set((s) => {
				// 重置非持久化运行态
				s.client = client;
				s.status = 'disconnected';
				s.agentName = '';
				s.agentVersion = '';
				s.error = undefined;
				s.sessionId = undefined;
				s.configOptions = [];
				s.modes = undefined;
				s.sessionInfo = undefined;
				s.isPrompting = false;
				s.messages = [];
				s.plan = [];
				s.tools = [];
				s.protocol = [];
				s.commands = [];
				s.usage = undefined;
				s.pendingPermission = undefined;
			});

			client.connect().catch((err) => {
				const msg = errorMessage(err);
				set((s) => {
					s.status = 'error';
					s.error = msg;
					pushMessage(s.messages, 'error', msg);
				});
			});
		},

		disconnect: async () => {
			const client = get().client;
			if (!client) return;
			subscriptions.get(client)?.();
			subscriptions.delete(client);
			await client.dispose();
			set((s) => {
				s.client = undefined;
				s.status = 'disconnected';
				s.sessionId = undefined;
				s.isPrompting = false;
				s.pendingPermission = undefined;
			});
		},

		// ── session ──
		setSessionToLoad: (value) =>
			set((s) => {
				s.sessionToLoad = value;
			}),

		newSession: () => {
			const client = get().client;
			if (!client) return;
			client
				.newSession()
				.then(({ warnings }) => {
					if (warnings.length === 0) return;
					set((s) => {
						for (const w of warnings) pushMessage(s.messages, 'system', `MCP config: ${w}`);
					});
				})
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						pushMessage(s.messages, 'error', msg);
					});
				});
		},

		loadSession: () => {
			const { client, sessionToLoad } = get();
			const id = sessionToLoad.trim();
			if (!client || !id) return;
			client
				.loadSession(id)
				.then(({ warnings }) => {
					if (warnings.length === 0) return;
					set((s) => {
						for (const w of warnings) pushMessage(s.messages, 'system', `MCP config: ${w}`);
					});
				})
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						pushMessage(s.messages, 'error', msg);
					});
				});
		},

		setMode: (mode) => {
			get()
				.client?.controller.setMode(mode)
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						pushMessage(s.messages, 'error', msg);
					});
				});
		},

		setConfigOption: (id, value) => {
			get()
				.client?.controller.setConfigOption(id, value)
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						pushMessage(s.messages, 'error', msg);
					});
				});
		},

		// ── prompt ──
		setPrompt: (value) =>
			set((s) => {
				s.prompt = value;
			}),

		sendPrompt: () => {
			const { client, prompt } = get();
			const text = prompt.trim();
			if (!text || !client) return;
			set((s) => {
				s.prompt = '';
				s.isPrompting = true;
				pushMessage(s.messages, 'user', text);
			});
			client.controller.sendPrompt(text).catch((err) => {
				const msg = errorMessage(err);
				set((s) => {
					pushMessage(s.messages, 'error', msg);
				});
			});
		},

		cancel: () => {
			get().client?.controller.cancel();
			set((s) => {
				s.isPrompting = false;
				pushMessage(s.messages, 'system', 'Cancellation requested.');
			});
		},

		// ── conversation ──
		clearMessages: () =>
			set((s) => {
				s.messages = [];
			}),

		// ── inspector ──
		setActiveTab: (tab) =>
			set((s) => {
				s.activeTab = tab;
			}),
		clearProtocol: () =>
			set((s) => {
				s.protocol = [];
			}),

		// ── permission ──
		resolvePermission: (optionId) => {
			const pending = get().pendingPermission;
			if (!pending) return;
			pending.resolve(optionId);
			set((s) => {
				s.pendingPermission = undefined;
			});
		},

		cancelPermission: () => {
			const pending = get().pendingPermission;
			if (!pending) return;
			pending.cancel();
			set((s) => {
				s.pendingPermission = undefined;
			});
		},

		// ── policy ──
		setPermissionStrategy: (value) => {
			set((s) => {
				s.permission = value;
			});
			get().client?.controller.setPermissionStrategy(value);
		},

		setProtocolEnabled: (value) => {
			set((s) => {
				s.protocolEnabled = value;
			});
			get().client?.controller.setProtocolEnabled(value);
		},

		// ── config ──
		setAutoConnect: (value) =>
			set((s) => {
				s.config.startup.autoConnect = value;
			}),

		// ── connections ──
		setActiveConnectionId: (id) =>
			set((s) => {
				s.config.activeConnectionId = id;
			}),

		loadConnections: async () => {
			let projectDir: string;
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const ue = require('ue') as typeof import('ue');
				projectDir = ue.JsRunHelper.GetProjectDir();
			} catch {
				return; // 非 UE 环境（测试）跳过
			}
			const { config, warning } = await loadConnectionsConfig(`${projectDir}/.config/acp-connections.json`);
			set((s) => {
				s.connections = config.connections;
				if (warning) pushMessage(s.messages, 'system', `Connections config: ${warning}`);
			});
		},

		// ── event sink ──
		ingestEvent: (event) => set((s) => ingestEvent(s as unknown as AcpPanelStateData, event)),
	});
};

// ──────────────────────────────────────────────────────────────────────────
// Persist
// ──────────────────────────────────────────────────────────────────────────

function makeStorage(custom?: AcpPanelStoreOptions['storage']): PersistStorage<PersistedState> {
	const base: import('zustand/middleware').StateStorage = custom ?? ueStorage;
	return {
		async getItem(name) {
			const raw = await base.getItem(name);
			if (raw === null || raw === undefined || raw === '') return null;
			try {
				return JSON.parse(raw) as StorageValue<PersistedState>;
			} catch {
				return null;
			}
		},
		setItem(name, value) {
			return base.setItem(name, JSON.stringify(value, null, 2));
		},
		removeItem(name) {
			return base.removeItem(name);
		},
	};
}

// ──────────────────────────────────────────────────────────────────────────
// Store 工厂
// ──────────────────────────────────────────────────────────────────────────

export type UseAcpPanelStore = UseBoundStore<StoreApi<AcpPanelStore>> & {
	persist: {
		hasHydrated: () => boolean;
		onFinishHydration: (listener: () => void) => () => void;
		rehydrate: () => Promise<void>;
		clearStorage: () => void;
	};
};

export function createAcpPanelStore(options: AcpPanelStoreOptions = {}): UseAcpPanelStore {
	const persistName = options.persistName ?? 'acp-panel';
	const useStore = create<AcpPanelStore>()(
		persist(immer(createSlices(options)), {
			name: persistName,
			storage: makeStorage(options.storage),
			partialize: (s): PersistedState => ({
				config: s.config,
				policy: { permission: s.permission, protocolEnabled: s.protocolEnabled },
				inspector: { activeTab: s.activeTab },
			}),
			merge: (persisted, current) => {
				const p = (persisted ?? {}) as Partial<PersistedState>;
				const baseConfig = current.config;
				return {
					...current,
					config: {
						activeConnectionId: p.config?.activeConnectionId ?? baseConfig.activeConnectionId,
						startup: { ...baseConfig.startup, ...(p.config?.startup ?? {}) },
					},
					permission: p.policy?.permission ?? current.permission,
					protocolEnabled: p.policy?.protocolEnabled ?? current.protocolEnabled,
					activeTab: p.inspector?.activeTab ?? current.activeTab,
				};
			},
		}),
	);
	return useStore as UseAcpPanelStore;
}

/** 默认单例（生产用）。 */
export const useAcpPanelStore: UseAcpPanelStore = createAcpPanelStore();
