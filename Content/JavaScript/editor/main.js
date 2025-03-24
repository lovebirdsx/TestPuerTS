"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const watcher_1 = require("./common/watcher");
const ue_1 = require("ue");
const mainEuw_1 = require("./mixin/mainEuw");
const runTest_1 = require("./tests/runTest");
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
    let tabId = undefined;
    let unBind;
    if (ue_1.EditorCommonLibrary.IsMainFrameCreationFinished_EditorOnly()) {
        const path = '/Game/Editor/W_Main.W_Main';
        unBind = (0, mainEuw_1.bindMainEUWClass)(path + '_C');
        tabId = ue_1.EditorCommonLibrary.ShowEditorWidget_EditorOnly(ue_1.EditorUtilityWidgetBlueprint.Load(path));
    }
    else {
        const editorEvent = ue_1.EditorCommonLibrary.GetEditorEvent_EditorOnly();
        editorEvent.OnOnMainFrameCreationFinished.Add(() => {
            const path = '/Game/Editor/W_Main.W_Main';
            unBind = (0, mainEuw_1.bindMainEUWClass)(path + '_C');
            tabId = ue_1.EditorCommonLibrary.ShowEditorWidget_EditorOnly(ue_1.EditorUtilityWidgetBlueprint.Load(path));
            ue_1.EditorCommonLibrary.CloseEditorWidget_EditorOnly(tabId);
            tabId = ue_1.EditorCommonLibrary.ShowEditorWidget_EditorOnly(ue_1.EditorUtilityWidgetBlueprint.Load(path));
        });
    }
    ue_1.TsEditorLibrary.GetTsEditor_EditorOnly().OnStopped.Add(() => {
        if (tabId) {
            ue_1.EditorCommonLibrary.CloseEditorWidget_EditorOnly(tabId);
        }
        unBind?.();
    });
}
function main() {
    startWatch();
    showMainEUW();
    const editorSettings = ue_1.TsEditorLibrary.GetTsEditorSettings_EditorOnly();
    if (editorSettings.bAutoRunUnitTests) {
        (0, runTest_1.runUnitTests)();
    }
}
main();
//# sourceMappingURL=main.js.map