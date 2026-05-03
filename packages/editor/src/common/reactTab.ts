import * as React from 'react';
import * as UE from 'ue';
import { ReactUMGInstance } from './umgRenderer';
import { trackTabOpen, untrackTabOpen } from './tabSession';

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

	// 记录 Tab 为"已打开"，供 TsEditor 重启后恢复
	trackTabOpen(tabName);

	// 用户点击 Tab 标题栏 X 关闭时，从 session 中移除（不再恢复）
	starter.OnTabClosed.Add(() => {
		untrackTabOpen(tabName);
	});

	// TsEditor 停止时关闭 Tab，但不从 session 移除（保留恢复意图）
	UE.TsEditorLibrary.GetTsEditor().OnStopped.Add(() => {
		UE.EditorCommonLibrary.CloseEditorWidget(tabId);
	});

	return {
		tabId,
		close() {
			untrackTabOpen(tabName);
			UE.EditorCommonLibrary.CloseEditorWidget(tabId);
		},
	};
}
