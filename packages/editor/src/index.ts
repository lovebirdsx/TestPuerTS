// editor 包的公开 API
// 仅导出允许外部包（如 tests）使用的内容
export type { IWidgetRoot } from './common/umgRenderer';
export { UEWidget, UEWidgetRoot, compareWidgetProps, createRendererForTest } from './common/umgRenderer';
