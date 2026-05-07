import {
	createLogger,
	flushAllPersistence,
	installConsoleOverride,
	installPuertsPolyfill,
} from '@universe-agent/editor-common';

// PuerTS setTimeout/setInterval 需要显式 delay；尽早 polyfill，避免第三方库（universe-lib / MCP SDK / ACP SDK 等）省略 delay 时定时器永不触发。
installPuertsPolyfill();

// 把 globalThis.console 重定向到 UJsLogHelper，让所有 JS 输出走 UE_LOG。
installConsoleOverride('editor');

import * as React from 'react';
import { TsEditorLibrary, EditorCommonLibrary } from 'ue';
import { openReactTab } from './common/reactTab';
import { registerTabFactory, restoreOpenTabs } from './common/tabSession';
import { SamplePanel } from './components/SamplePanel';
import { AcpClientPanel } from './components/AcpClientPanel';
import { registerEditorMenus } from './common/menu';

const logger = createLogger('editor:main');

let menuDisposable: { dispose(): void } | undefined;

// Tab 元数据：tabName → label（注册工厂和菜单共用）
const TAB_CONFIGS = [
	{
		tabName: 'SampleReactTab',
		tabLabel: 'Sample React Panel',
		factory: () => React.createElement(SamplePanel),
		menuId: 'editor.tabs.openSampleReactPanel',
		menuLabel: 'Open Sample React Panel',
		menuTooltip: 'Open the sample React UMG editor tab',
		menuPath: ['Panels'] as string[],
		menuSortOrder: undefined as number | undefined,
	},
	{
		tabName: 'AcpClientTab',
		tabLabel: 'ACP Client',
		factory: () => React.createElement(AcpClientPanel),
		menuId: 'editor.openAcpClient',
		menuLabel: 'Open ACP Client',
		menuTooltip: 'Open the ACP Client editor tab',
		menuPath: undefined as string[] | undefined,
		menuSortOrder: 10,
	},
] as const;

function registerMenus() {
	// 同步注册工厂，供恢复时使用
	for (const cfg of TAB_CONFIGS) {
		registerTabFactory(cfg.tabName, cfg.factory);
	}

	menuDisposable = registerEditorMenus(
		TAB_CONFIGS.map((cfg) => ({
			id: cfg.menuId,
			label: cfg.menuLabel,
			tooltip: cfg.menuTooltip,
			path: cfg.menuPath,
			sortOrder: cfg.menuSortOrder,
			onExecute: () => openReactTab(cfg.tabName, cfg.tabLabel, cfg.factory()),
		})),
	);

	TsEditorLibrary.GetTsEditor().OnStopped.Add(() => {
		menuDisposable?.dispose();
		menuDisposable = undefined;
	});
}

function restoreTabsOnStart() {
	TsEditorLibrary.GetTsEditor().OnStarted.Add(() => {
		void restoreOpenTabs((tabName, factory) => {
			const cfg = TAB_CONFIGS.find((c) => c.tabName === tabName);
			if (cfg) {
				openReactTab(tabName, cfg.tabLabel, factory());
			}
		});
	});
}

function registerExitHooks() {
	// 编辑器退出前 flush 所有持久化 store，避免丢失最近的修改
	const editorEvent = EditorCommonLibrary.GetEditorEvent();
	editorEvent.OnPreExit.Add(() => {
		flushAllPersistence().catch((err) => {
			logger.error(`flushAllPersistence failed: ${(err as Error).message ?? err}`);
		});
	});
}

function main() {
	registerMenus();
	restoreTabsOnStart();
	registerExitHooks();
}

main();
