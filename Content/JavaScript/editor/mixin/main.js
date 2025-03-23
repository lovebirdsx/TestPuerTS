"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindMainEUWClass = bindMainEUWClass;
const puerts_1 = require("puerts");
const ue = require("ue");
;
class MainEUW {
    Bind() {
        this.ButtonRestartEditor.OnClicked.Add(() => {
            ue.TsEditorLibrary.GetTsEditor_EditorOnly().Restart_EditorOnly();
        });
        this.ButtonBasicTest.OnClicked.Add(() => {
            console.log('ButtonBasicTest clicked!');
        });
    }
}
function bindMainEUWClass() {
    const ucls = ue.Class.Load('/Game/Editor/W_Main.W_Main_C');
    const JsMainEUW = puerts_1.blueprint.tojs(ucls);
    const MixinMainEUW = puerts_1.blueprint.mixin(JsMainEUW, MainEUW);
    return MixinMainEUW;
}
//# sourceMappingURL=main.js.map