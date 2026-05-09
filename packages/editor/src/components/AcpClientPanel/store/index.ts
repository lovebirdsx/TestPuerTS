import type { AcpClient, AcpUiEvent } from '@universe-agent/acp-client-ue';
import { create, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import type {
	AcpClientFactory,
	AcpConnectionStatus,
	AcpPanelStoreOptions,
	AcpPermissionStrategy,
	CommandEntry,
	DrawerKey,
	InspectorTab,
	MessageRole,
	PendingPermissionRequest,
	PersistedConfig,
	PersistedState,
	PlanEntry,
	ProtocolEntry,
	SessionConfigOption,
	SessionInfo,
	SessionListEntry,
	SessionModeState,
	TimelineItem,
	UsageInfo,
} from '../types';
import { type ConnectionProfile, loadConnectionsConfig } from './connectionConfig';
import { ueStorage } from './ueStorage';

// 转出常用类型，方便领域组件按 `'../../store'` 路径就近引用
export type {
	CommandEntry,
	DrawerKey,
	InspectorTab,
	MessageRole,
	PendingPermissionRequest,
	PersistedConfig,
	PersistedState,
	PlanEntry,
	PlanItem,
	ProtocolEntry,
	SessionConfigOption,
	SessionInfo,
	SessionListEntry,
	SessionModeState,
	TextItem,
	TimelineItem,
	ToolItem,
	UsageInfo,
} from '../types';
export type { ConnectionProfile } from './connectionConfig';

const PROTOCOL_LIMIT = 200;
const DEFAULT_COMMAND = 'npx universe-agent-acp';

let nextItemId = 1;
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
	configOptions: SessionConfigOption[];
	modes: SessionModeState | undefined;
	sessionInfo: SessionInfo | undefined;
	sessions: SessionListEntry[];
	sessionsLoading: boolean;
	sessionsError: string | undefined;

	// prompt
	prompt: string;
	isPrompting: boolean;

	// conversation
	timeline: TimelineItem[];
	/** 当前轮 plan 卡的 id；prompt_finished/error 后清空，让下一轮 plan 起新卡。 */
	activePlanItemId: number | undefined;

	// inspector
	activeTab: InspectorTab;
	protocol: ProtocolEntry[];
	commands: CommandEntry[];
	usage: UsageInfo | undefined;

	// ui（不持久化）
	activeDrawer: DrawerKey | undefined;

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
	newSession: () => void;
	switchSession: (sessionId: string) => void;
	refreshSessions: () => Promise<void>;
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

	// ui
	setActiveDrawer: (key: DrawerKey | undefined) => void;
	toggleDrawer: (key: DrawerKey) => void;

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
		configOptions: [],
		modes: undefined,
		sessionInfo: undefined,
		sessions: [],
		sessionsLoading: false,
		sessionsError: undefined,

		prompt: '',
		isPrompting: false,

		timeline: [],
		activePlanItemId: undefined,

		activeTab: 'state',
		protocol: [],
		commands: [],
		usage: undefined,

		activeDrawer: undefined,

		pendingPermission: undefined,

		permission: 'interactive',
		protocolEnabled: false,

		config: defaultConfig(),
	};
}

// ──────────────────────────────────────────────────────────────────────────
// 工具（导出供测试）
// ──────────────────────────────────────────────────────────────────────────

export function pushTextItem(timeline: TimelineItem[], role: MessageRole, text: string): void {
	timeline.push({ kind: 'text', id: nextItemId++, role, text });
}

export function appendStreamText(timeline: TimelineItem[], role: MessageRole, text: string): void {
	const last = timeline[timeline.length - 1];
	if (last && last.kind === 'text' && last.role === role) {
		last.text = last.text + text;
		return;
	}
	pushTextItem(timeline, role, text);
}

export function upsertToolItem(
	timeline: TimelineItem[],
	event: Extract<AcpUiEvent, { type: 'tool_call_updated' }>,
): void {
	for (let i = timeline.length - 1; i >= 0; i--) {
		const item = timeline[i]!;
		if (item.kind === 'tool' && item.toolCallId === event.toolCallId) {
			// 浅合并：仅当事件提供了新值时覆盖（tool_call_update 通常不重发 rawInput）
			if (event.title) item.title = event.title;
			if (event.kind !== undefined) item.toolKind = event.kind;
			if (event.status !== undefined) item.status = event.status;
			if (event.rawInput !== undefined) item.rawInput = event.rawInput;
			if (event.rawOutput !== undefined) item.rawOutput = event.rawOutput;
			if (event.content !== undefined) item.content = event.content;
			return;
		}
	}
	timeline.push({
		kind: 'tool',
		id: nextItemId++,
		toolCallId: event.toolCallId,
		title: event.title,
		toolKind: event.kind,
		status: event.status,
		rawInput: event.rawInput,
		rawOutput: event.rawOutput,
		content: event.content,
	});
}

export function upsertPlanItem(
	state: { timeline: TimelineItem[]; activePlanItemId: number | undefined },
	entries: PlanEntry[],
): void {
	if (state.activePlanItemId !== undefined) {
		const existing = state.timeline.find((i) => i.kind === 'plan' && i.id === state.activePlanItemId);
		if (existing && existing.kind === 'plan') {
			existing.entries = entries;
			return;
		}
	}
	const id = nextItemId++;
	state.timeline.push({ kind: 'plan', id, entries });
	state.activePlanItemId = id;
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

/** 把面板里随会话产生的运行态全部重置；不动连接、配置、策略相关字段。 */
export function resetSessionRuntime(s: AcpPanelStateData): void {
	s.sessionId = undefined;
	s.configOptions = [];
	s.modes = undefined;
	s.sessionInfo = undefined;
	s.isPrompting = false;
	s.timeline = [];
	s.activePlanItemId = undefined;
	s.protocol = [];
	s.commands = [];
	s.usage = undefined;
	s.pendingPermission = undefined;
}

/** Session-bound 事件：只有 sessionId 与当前 active session 一致才落地，避免切换时尾随事件污染。 */
function isSessionBoundEvent(event: AcpUiEvent): event is Extract<AcpUiEvent, { sessionId: string }> {
	switch (event.type) {
		case 'message_chunk':
		case 'thought_chunk':
		case 'plan_updated':
		case 'tool_call_updated':
		case 'commands_updated':
		case 'mode_updated':
		case 'config_options_updated':
		case 'session_info_updated':
		case 'usage_updated':
			return true;
		default:
			return false;
	}
}

// ──────────────────────────────────────────────────────────────────────────
// EventSink：把 controller 事件投影到 store
// ──────────────────────────────────────────────────────────────────────────

export function ingestEvent(s: AcpPanelStateData, event: AcpUiEvent): void {
	// session-bound 事件先做归属过滤；旧 session 的尾随更新一律丢弃。
	if (isSessionBoundEvent(event) && event.sessionId !== s.sessionId) {
		return;
	}

	switch (event.type) {
		case 'status_changed':
			s.status = event.status;
			if (event.message) s.error = event.message;
			break;
		case 'initialized':
			s.agentName = event.result.agentInfo?.name ?? 'agent';
			s.agentVersion = event.result.agentInfo?.version ?? '';
			break;
		case 'session_changed': {
			const id = event.session.sessionId;
			s.sessionId = id;
			s.configOptions = event.session.configOptions ?? [];
			s.modes = event.session.modes ?? undefined;
			s.sessionInfo = event.session.sessionInfo ?? { sessionId: id };
			pushTextItem(s.timeline, 'system', `Session ready: ${id}`);
			// 把当前 session 提到列表头部（若已存在则就地更新 / 提升）。
			const existingIdx = s.sessions.findIndex((x) => x.sessionId === id);
			const merged = {
				sessionId: id,
				title: event.session.sessionInfo?.title ?? s.sessions[existingIdx]?.title ?? null,
				createdAt: event.session.sessionInfo?.createdAt ?? s.sessions[existingIdx]?.createdAt ?? null,
				updatedAt: event.session.sessionInfo?.updatedAt ?? new Date().toISOString(),
			};
			if (existingIdx >= 0) s.sessions.splice(existingIdx, 1);
			s.sessions.unshift(merged);
			break;
		}
		case 'message_chunk':
			appendStreamText(s.timeline, event.role, event.text);
			break;
		case 'thought_chunk':
			appendStreamText(s.timeline, 'thought', event.text);
			break;
		case 'plan_updated':
			upsertPlanItem(s, event.entries);
			break;
		case 'tool_call_updated':
			upsertToolItem(s.timeline, event);
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
		case 'session_info_updated': {
			s.sessionInfo = { ...(s.sessionInfo ?? {}), ...event.sessionInfo };
			// 同步到 sessions 列表里同 id 的条目，让 SessionPicker 能反映最新 title。
			const idx = s.sessions.findIndex((x) => x.sessionId === event.sessionId);
			if (idx >= 0) {
				s.sessions[idx] = {
					...s.sessions[idx]!,
					title: event.sessionInfo.title ?? s.sessions[idx]!.title ?? null,
					updatedAt: event.sessionInfo.updatedAt ?? new Date().toISOString(),
				};
			}
			break;
		}
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
			s.activePlanItemId = undefined;
			pushTextItem(s.timeline, 'system', `Stop reason: ${event.stopReason}`);
			break;
		case 'error':
			s.error = event.message;
			s.isPrompting = false;
			s.activePlanItemId = undefined;
			pushTextItem(s.timeline, 'error', event.message);
			break;
		case 'session_listed':
			s.sessions = (event.result.sessions ?? []).map((x) => ({
				sessionId: x.sessionId,
				title: x.title ?? null,
				createdAt: x.createdAt ?? null,
				updatedAt: x.updatedAt ?? null,
			}));
			s.sessionsLoading = false;
			s.sessionsError = undefined;
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
				s.client = client;
				s.status = 'disconnected';
				s.agentName = '';
				s.agentVersion = '';
				s.error = undefined;
				s.sessions = [];
				s.sessionsLoading = false;
				s.sessionsError = undefined;
				resetSessionRuntime(s as unknown as AcpPanelStateData);
			});

			client
				.connect()
				.then(() => {
					// 连接建立后立即拉取历史会话列表，让 SessionPicker 可用。
					void get().refreshSessions();
				})
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						s.status = 'error';
						s.error = msg;
						pushTextItem(s.timeline, 'error', msg);
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
				s.sessions = [];
				s.sessionsLoading = false;
				s.sessionsError = undefined;
				resetSessionRuntime(s as unknown as AcpPanelStateData);
			});
		},

		// ── session ──

		newSession: () => {
			const client = get().client;
			if (!client) return;
			set((s) => {
				resetSessionRuntime(s as unknown as AcpPanelStateData);
			});
			client
				.newSession()
				.then(({ warnings }) => {
					set((s) => {
						for (const w of warnings) pushTextItem(s.timeline, 'system', `MCP config: ${w}`);
					});
					void get().refreshSessions();
				})
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						pushTextItem(s.timeline, 'error', msg);
					});
				});
		},

		switchSession: (sessionId) => {
			const { client, sessionId: current } = get();
			const id = sessionId.trim();
			if (!client || !id) return;
			if (id === current) return;
			set((s) => {
				resetSessionRuntime(s as unknown as AcpPanelStateData);
				// 乐观置入新 sessionId，确保后续 session/update 通知能通过归属过滤；
				// 加载失败时由 catch 分支回滚为 undefined。
				s.sessionId = id;
			});
			client
				.loadSession(id)
				.then(({ warnings }) => {
					set((s) => {
						for (const w of warnings) pushTextItem(s.timeline, 'system', `MCP config: ${w}`);
					});
					void get().refreshSessions();
				})
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						s.sessionId = undefined;
						pushTextItem(s.timeline, 'error', msg);
					});
				});
		},

		refreshSessions: async () => {
			const client = get().client;
			if (!client) {
				set((s) => {
					s.sessions = [];
					s.sessionsLoading = false;
					s.sessionsError = undefined;
				});
				return;
			}
			set((s) => {
				s.sessionsLoading = true;
				s.sessionsError = undefined;
			});
			try {
				const result = await client.controller.listSessions();
				set((s) => {
					s.sessions = (result.sessions ?? []).map((x) => ({
						sessionId: x.sessionId,
						title: x.title ?? null,
						createdAt: x.createdAt ?? null,
						updatedAt: x.updatedAt ?? null,
					}));
					s.sessionsLoading = false;
				});
			} catch (err) {
				const msg = errorMessage(err);
				set((s) => {
					s.sessionsLoading = false;
					s.sessionsError = msg;
				});
			}
		},

		setMode: (mode) => {
			get()
				.client?.controller.setMode(mode)
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						pushTextItem(s.timeline, 'error', msg);
					});
				});
		},

		setConfigOption: (id, value) => {
			get()
				.client?.controller.setConfigOption(id, value)
				.catch((err) => {
					const msg = errorMessage(err);
					set((s) => {
						pushTextItem(s.timeline, 'error', msg);
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
				pushTextItem(s.timeline, 'user', text);
			});
			client.controller.sendPrompt(text).catch((err) => {
				const msg = errorMessage(err);
				set((s) => {
					pushTextItem(s.timeline, 'error', msg);
				});
			});
		},

		cancel: () => {
			get().client?.controller.cancel();
			set((s) => {
				s.isPrompting = false;
				s.activePlanItemId = undefined;
				pushTextItem(s.timeline, 'system', 'Cancellation requested.');
			});
		},

		// ── conversation ──
		clearMessages: () =>
			set((s) => {
				s.timeline = [];
				s.activePlanItemId = undefined;
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

		// ── ui ──
		setActiveDrawer: (key) =>
			set((s) => {
				s.activeDrawer = key;
			}),
		toggleDrawer: (key) =>
			set((s) => {
				s.activeDrawer = s.activeDrawer === key ? undefined : key;
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
				if (warning) pushTextItem(s.timeline, 'system', `Connections config: ${warning}`);
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
				// 旧持久化里的 'plan' / 'tools' tab 已下线，退化为 'state'
				const persistedTab = p.inspector?.activeTab as InspectorTab | undefined;
				const validTabs: InspectorTab[] = ['protocol', 'state', 'commands'];
				const activeTab = persistedTab && validTabs.includes(persistedTab) ? persistedTab : current.activeTab;
				return {
					...current,
					config: {
						activeConnectionId: p.config?.activeConnectionId ?? baseConfig.activeConnectionId,
						startup: { ...baseConfig.startup, ...(p.config?.startup ?? {}) },
					},
					permission: p.policy?.permission ?? current.permission,
					protocolEnabled: p.policy?.protocolEnabled ?? current.protocolEnabled,
					activeTab,
				};
			},
		}),
	);
	return useStore as UseAcpPanelStore;
}

/** 默认单例（生产用）。 */
export const useAcpPanelStore: UseAcpPanelStore = createAcpPanelStore();
