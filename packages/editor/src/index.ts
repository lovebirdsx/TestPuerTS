// editor 包的公开 API
// 仅导出允许外部包（如 tests）使用的内容
export type { IWidgetRoot } from './common/umgRenderer';
export { UEWidget, UEWidgetRoot, compareWidgetProps, createRendererForTest } from './common/umgRenderer';
export type { Disposable, EditorMenuRegistration } from './common/menu';
export { registerEditorMenu, registerEditorMenus, unregisterEditorMenu } from './common/menu';

// 组件 + reducer（供测试引用）
export { AcpClientPanel } from './components/AcpClientPanel';
export {
	reduceEvent,
	createInitialState,
	splitArgs,
	addMessage,
	appendStreamMessage,
	upsertTool,
} from './components/AcpClientPanel';
export type {
	AcpClientPanelProps,
	AcpControllerFactory,
	AcpPanelState,
	ChatMessage,
	ToolRecord,
	MessageRole,
	InspectorTab,
} from './components/AcpClientPanel';
