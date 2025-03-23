"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const watcher_1 = require("./common/watcher");
const ue = require("ue");
function startWatch() {
    const watcher = (0, watcher_1.watch)(__dirname, () => {
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
//# sourceMappingURL=main.js.map