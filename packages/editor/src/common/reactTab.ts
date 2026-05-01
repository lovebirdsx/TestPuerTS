import * as React from 'react';
import * as UE from 'ue';
import { ReactUMGInstance } from './umgRenderer';

export interface ReactTabHandle {
	tabId: string;
	close(): void;
}

/**
 * 在编辑器中打开一个 ReactUMG 驱动的 Tab
 * @param tabName   Tab 的唯一标识符（FName）
 * @param tabLabel  Tab 标题栏显示的文本
 * @param component 要渲染的 React 组件
 */
export function openReactTab(tabName: string, tabLabel: string, component: React.ReactElement): ReactTabHandle {
	const starter = new UE.ReactUMGStarter();
	const tabId = starter.StartWithName(tabName, tabLabel);

	const instance = new ReactUMGInstance();
	instance.init(starter);
	instance.render(component);

	return {
		tabId,
		close() {
			UE.EditorCommonLibrary.CloseEditorWidget(tabId);
		},
	};
}
