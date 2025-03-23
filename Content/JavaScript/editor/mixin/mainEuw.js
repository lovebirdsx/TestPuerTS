"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindMainEUWClass = bindMainEUWClass;
const puerts_1 = require("puerts");
const ue = require("ue");
;
class MainEUW {
    Bind() {
        const tsEditor = ue.TsEditorLibrary.GetTsEditor_EditorOnly();
        this.ButtonRestartEditor.OnClicked.Add(() => {
            tsEditor.Restart_EditorOnly();
        });
        this.ButtonBasicTest.OnClicked.Add(() => {
            console.log('ButtonBasicTest clicked!');
        });
        this.ButtonContainerTest.OnClicked.Add(() => {
            console.log('ButtonContainerTest clicked!');
        });
    }
}
function bindMainEUWClass(path) {
    const ucls = ue.Class.Load(path);
    const JsMainEUW = puerts_1.blueprint.tojs(ucls);
    const MixinMainEUW = puerts_1.blueprint.mixin(JsMainEUW, MainEUW);
    return MixinMainEUW;
}
//# sourceMappingURL=mainEuw.js.map