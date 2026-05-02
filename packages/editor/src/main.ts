import * as React from 'react';
import { watch } from './common/watcher';
import { TsEditorLibrary, EditorUtilityWidgetBlueprint, EditorCommonLibrary } from 'ue';
import { bindMainEUWClass } from './mixin/mainEuw';
import { runUnitTests } from './tests/runTest';
import { openReactTab, ReactTabHandle } from './common/reactTab';
import { SamplePanel } from './components/SamplePanel';
import { AcpClientPanel } from './components/AcpClientPanel';

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

function showMainEUW() {
	let tabId: string | undefined = undefined;
	let unBind: () => void;

	if (EditorCommonLibrary.IsMainFrameCreationFinished()) {
		const path = '/Game/Editor/W_Main.W_Main';
		unBind = bindMainEUWClass(path + '_C');
		tabId = EditorCommonLibrary.ShowEditorWidget(EditorUtilityWidgetBlueprint.Load(path));
	} else {
		const editorEvent = EditorCommonLibrary.GetEditorEvent();
		editorEvent.OnOnMainFrameCreationFinished.Add(() => {
			const path = '/Game/Editor/W_Main.W_Main';
			unBind = bindMainEUWClass(path + '_C');
			tabId = EditorCommonLibrary.ShowEditorWidget(EditorUtilityWidgetBlueprint.Load(path));
			EditorCommonLibrary.CloseEditorWidget(tabId);
			tabId = EditorCommonLibrary.ShowEditorWidget(EditorUtilityWidgetBlueprint.Load(path));
		});
	}

	TsEditorLibrary.GetTsEditor().OnStopped.Add(() => {
		if (tabId) {
			EditorCommonLibrary.CloseEditorWidget(tabId);
		}
		unBind?.();
	});
}

function showReactTab() {
	let handle: ReactTabHandle | undefined;
	let acpHandle: ReactTabHandle | undefined;

	const open = () => {
		handle = openReactTab('SampleReactTab', 'Sample React Panel', React.createElement(SamplePanel));
		acpHandle = openReactTab('AcpClientTab', 'ACP Client', React.createElement(AcpClientPanel));
	};

	if (EditorCommonLibrary.IsMainFrameCreationFinished()) {
		open();
	} else {
		EditorCommonLibrary.GetEditorEvent().OnOnMainFrameCreationFinished.Add(open);
	}

	TsEditorLibrary.GetTsEditor().OnStopped.Add(() => {
		handle?.close();
		acpHandle?.close();
	});
}

function main() {
	startWatch();
	showMainEUW();
	showReactTab();

	const editorSettings = TsEditorLibrary.GetTsEditorSettings();
	if (editorSettings.bAutoRunUnitTests) {
		runUnitTests();
	}
}

main();
