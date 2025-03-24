import { blueprint } from 'puerts';
import * as ue from 'ue';
import { runTest } from '../tests/runTest';

interface MainEUW extends ue.Game.Editor.W_Main.W_Main_C {}

class MainEUW {
	OnClick(event: string) {
		runTest(event);
	}
}

export function bindMainEUWClass(path: string) {
	const ucls = ue.Class.Load(path);
	const JsMainEUW = blueprint.tojs<typeof ue.Game.Editor.W_Main.W_Main_C>(ucls);
	blueprint.mixin(JsMainEUW, MainEUW);
	return () => {
		blueprint.unmixin(JsMainEUW);
	};
}
