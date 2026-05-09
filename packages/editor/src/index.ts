// editor 包的公开 API
// 仅导出允许外部包（如 tests）使用的内容
export type { IWidgetRoot } from './common/umgRenderer';
export { UEWidget, UEWidgetRoot, compareWidgetProps, createRendererForTest } from './common/umgRenderer';
export type { Disposable, EditorMenuRegistration } from './common/menu';
export { registerEditorMenu, registerEditorMenus, unregisterEditorMenu } from './common/menu';

// AcpClientPanel：组件 + store + 类型（供测试引用）
export { AcpClientPanel } from './components/AcpClientPanel';
export {
	createAcpPanelStore,
	useAcpPanelStore,
	StoreProvider,
	useStore,
	useStoreSelector,
	useStoreAction,
	useHydration,
	createMemoryStorage,
} from './components/AcpClientPanel';
export {
	pushTextItem,
	appendStreamText,
	upsertToolItem,
	upsertPlanItem,
	splitArgs,
	errorMessage,
	ingestEvent,
} from './components/AcpClientPanel/store';
export type {
	AcpClientPanelProps,
	AcpClientFactory,
	AcpPanelStore,
	AcpPanelStoreOptions,
	UseAcpPanelStore,
	TimelineItem,
	TextItem,
	ToolItem,
	PlanItem,
	MessageRole,
	PlanEntry,
	ProtocolEntry,
	UsageInfo,
	CommandEntry,
	PersistedConfig,
	PersistedPolicy,
	PersistedState,
} from './components/AcpClientPanel';
