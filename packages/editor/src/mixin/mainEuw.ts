import { blueprint } from 'puerts';
import * as ue from 'ue';

interface MainEUW extends ue.Game.Editor.W_Main.W_Main_C {};

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

export function bindMainEUWClass(path: string) {
    const ucls = ue.Class.Load(path);
    const JsMainEUW = blueprint.tojs<typeof ue.Game.Editor.W_Main.W_Main_C>(ucls);
    const MixinMainEUW = blueprint.mixin(JsMainEUW, MainEUW);
    return MixinMainEUW;
}
