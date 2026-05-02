import * as React from 'react';
import { watch } from './common/watcher';
import { TsEditorLibrary, EditorCommonLibrary } from 'ue';
import { runUnitTests } from './tests/runTest';
import { openReactTab } from './common/reactTab';
import { SamplePanel } from './components/SamplePanel';
import { AcpClientPanel } from './components/AcpClientPanel';
import { registerEditorMenus } from './common/menu';
import { runBasicTest } from './tests/basicTest';
import { flushAllPersistence } from './common/persistence';

let menuDisposable: { dispose(): void } | undefined;

function startWatch() {
	const watcher = watch(__dirname, () => {
		const editor = TsEditorLibrary.GetTsEditor();
		if (editor) {
			console.log('Restarting editor...');
			editor.Restart();
		}
	});

	console.log('Editor watcher: watching for changes...');
	return watcher;
}

function registerMenus() {
	menuDisposable = registerEditorMenus([
		{
			id: 'editor.tests.runUnitTests',
			label: 'Run Unit Tests',
			tooltip: 'Run editor package unit tests',
			path: ['Tests'],
			onExecute: () => runUnitTests(),
		},
		{
			id: 'editor.tests.runBasicTest',
			label: 'Run Basic Test',
			tooltip: 'Run puerts basic tests',
			path: ['Tests'],
			onExecute: () => runBasicTest(),
		},
		{
			id: 'editor.tabs.openSampleReactPanel',
			label: 'Open Sample React Panel',
			tooltip: 'Open the sample React UMG editor tab',
			path: ['Panels'],
			onExecute: () => openReactTab('SampleReactTab', 'Sample React Panel', React.createElement(SamplePanel)),
		},
		{
			id: 'editor.openAcpClient',
			label: 'Open ACP Client',
			tooltip: 'Open the ACP Client editor tab',
			sortOrder: 10,
			onExecute: () => openReactTab('AcpClientTab', 'ACP Client', React.createElement(AcpClientPanel)),
		},
	]);

	TsEditorLibrary.GetTsEditor().OnStopped.Add(() => {
		menuDisposable?.dispose();
		menuDisposable = undefined;
	});
}

function registerExitHooks() {
	// 编辑器退出前 flush 所有持久化 store，避免丢失最近的修改
	const editorEvent = EditorCommonLibrary.GetEditorEvent();
	editorEvent.OnPreExit.Add(() => {
		flushAllPersistence().catch((err) => {
			console.error(`flushAllPersistence failed: ${(err as Error).message ?? err}`);
		});
	});
}

function main() {
	startWatch();
	registerMenus();
	registerExitHooks();

	const editorSettings = TsEditorLibrary.GetTsEditorSettings();
	if (editorSettings.bAutoRunUnitTests) {
		runUnitTests();
	}
}

main();
