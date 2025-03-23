import { watch } from './common/watcher';
import { TsEditorLibrary, EditorUtilityWidgetBlueprint } from 'ue';
import { bindMainEUWClass } from './mixin/mainEuw';

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
	const path = '/Game/Editor/W_Main.W_Main';
	bindMainEUWClass(path + '_C');
	const tabId = TsEditorLibrary.ShowEditorWidget_EditorOnly(EditorUtilityWidgetBlueprint.Load(path));
	TsEditorLibrary.GetTsEditor_EditorOnly().OnStopped.Add(() => {
		TsEditorLibrary.CloseEditorWidget_EditorOnly(tabId);
	});
}

function main() {
	startWatch();
	showMainEUW();
	console.log('Editor started!');
}

main();
