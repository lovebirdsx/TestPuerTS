import { watch } from './common/watcher';
import * as ue from 'ue';

function startWatch() {
	const watcher = watch(__dirname, () => {
		const editor = ue.TsEditorLibrary.GetTsEditor_EditorOnly();
		if (editor) {
			console.log('Restarting editor...');
			editor.Restart_EditorOnly();
		}
	});

	console.log('Editor watcher: watching for changes...');

	return watcher;
}

function main() {
	startWatch();
	console.log('Editor started.');
}

main();
