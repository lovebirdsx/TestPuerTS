"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const watcher_1 = require("./common/watcher");
const ue_1 = require("ue");
const mainEuw_1 = require("./mixin/mainEuw");
function startWatch() {
    const watcher = (0, watcher_1.watch)(__dirname, () => {
        const editor = ue_1.TsEditorLibrary.GetTsEditor_EditorOnly();
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
    (0, mainEuw_1.bindMainEUWClass)(path + '_C');
    const tabId = ue_1.TsEditorLibrary.ShowEditorWidget_EditorOnly(ue_1.EditorUtilityWidgetBlueprint.Load(path));
    ue_1.TsEditorLibrary.GetTsEditor_EditorOnly().OnStopped.Add(() => {
        ue_1.TsEditorLibrary.CloseEditorWidget_EditorOnly(tabId);
    });
}
function main() {
    startWatch();
    showMainEUW();
    console.log('Editor started!');
}
main();
//# sourceMappingURL=main.js.map