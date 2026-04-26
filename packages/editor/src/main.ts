import { watch } from './common/watcher';
import { TsEditorLibrary, EditorUtilityWidgetBlueprint, EditorCommonLibrary } from 'ue';
import { bindMainEUWClass } from './mixin/mainEuw';
import { runUnitTests } from './tests/runTest';

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

function main() {
	startWatch();
	showMainEUW();

	const editorSettings = TsEditorLibrary.GetTsEditorSettings();
	if (editorSettings.bAutoRunUnitTests) {
		runUnitTests();
	}
}

main();
