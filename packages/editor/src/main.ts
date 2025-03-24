import { watch } from './common/watcher';
import { TsEditorLibrary, EditorUtilityWidgetBlueprint, EditorCommonLibrary } from 'ue';
import { bindMainEUWClass } from './mixin/mainEuw';
import { runUnitTests } from './tests/runTest';

function startWatch() {
	const watcher = watch(__dirname, () => {
		const editor = TsEditorLibrary.GetTsEditor_EditorOnly();
		if (editor) {
			console.log('Restarting editor...');
			editor.Restart_EditorOnly();
		}
	});

	console.log('Editor watcher: watching for changes...');
	return watcher;
}

function showMainEUW() {
	let tabId: string | undefined = undefined;
	let unBind: () => void;

	if (EditorCommonLibrary.IsMainFrameCreationFinished_EditorOnly()) {
		const path = '/Game/Editor/W_Main.W_Main';
		unBind = bindMainEUWClass(path + '_C');
		tabId = EditorCommonLibrary.ShowEditorWidget_EditorOnly(EditorUtilityWidgetBlueprint.Load(path));
	} else {
		const editorEvent = EditorCommonLibrary.GetEditorEvent_EditorOnly();
		editorEvent.OnOnMainFrameCreationFinished.Add(() => {
			const path = '/Game/Editor/W_Main.W_Main';
			unBind = bindMainEUWClass(path + '_C');
			tabId = EditorCommonLibrary.ShowEditorWidget_EditorOnly(EditorUtilityWidgetBlueprint.Load(path));
			EditorCommonLibrary.CloseEditorWidget_EditorOnly(tabId);
			tabId = EditorCommonLibrary.ShowEditorWidget_EditorOnly(EditorUtilityWidgetBlueprint.Load(path));
		});
	}

	TsEditorLibrary.GetTsEditor_EditorOnly().OnStopped.Add(() => {
		if (tabId) {
			EditorCommonLibrary.CloseEditorWidget_EditorOnly(tabId);
		}
		unBind?.();
	});
}

function main() {
	startWatch();
	showMainEUW();

	const editorSettings = TsEditorLibrary.GetTsEditorSettings_EditorOnly();
	if (editorSettings.bAutoRunUnitTests) {
		runUnitTests();
	}
}

main();
