// editor 包的公开 API
// 仅导出允许外部包（如 tests）使用的内容
export type { IWidgetRoot } from './common/umgRenderer';
export { UEWidget, UEWidgetRoot, compareWidgetProps, createRendererForTest } from './common/umgRenderer';
export type { Disposable, EditorMenuRegistration } from './common/menu';
export { registerEditorMenu, registerEditorMenus, unregisterEditorMenu } from './common/menu';

// 持久化模块（基于 zod）
export {
	defineStore,
	PersistenceStore,
	flushAllPersistence,
	setPersistenceRoot,
	getPersistenceRoot,
} from './common/persistence';
export type { ChangeListener, DefineStoreOptions, IFileIO } from './common/persistence';
