import * as ue from 'ue';
import { describe, it, expect } from '../testRunner';

function waitLatentActionState(state: ue.LatentActionState): Promise<void> {
	return new Promise<void>((resolve) => {
		state.LatentActionCallback.Bind(() => {
			state.LatentActionCallback.Unbind();
			resolve();
		});
	});
}

function asyncLoad(path: string): Promise<ue.Class> {
	return new Promise<ue.Class>((resolve, reject) => {
		const asyncLoadObj = new ue.AsyncLoadState();
		asyncLoadObj.LoadedCallback.Bind((cls: ue.Class) => {
			asyncLoadObj.LoadedCallback.Unbind();
			if (cls) {
				resolve(cls);
			} else {
				reject(`load ${path} fail`);
			}
		});
		asyncLoadObj.StartLoad(path);
	});
}

// GetEditorWorld 依赖 viewport client，commandlet 中拿不到；async load/latent action
// 也依赖 editor tick 才能触发回调。整组在缺少 editor world 时跳过。
const editorWorldAvailable = !!ue.EditorCommonLibrary.GetEditorWorld();

if (!editorWorldAvailable) {
	describe.skip('UeBindings > Async', () => {
		it.skip('latent action');
		it.skip('async load');
	});
} else {
	describe('UeBindings > Async', () => {
		it('latent action', async () => {
			const actionState = new ue.LatentActionState();
			const world = ue.EditorCommonLibrary.GetEditorWorld()!;
			ue.KismetSystemLibrary.Delay(world, 0.001, actionState.GetLatentActionInfo());
			await waitLatentActionState(actionState);
		});

		it('async load', async () => {
			const path = '/Game/Editor/B_Object.B_Object_C';
			const cls = await asyncLoad(path);
			expect(cls !== undefined).toBeTruthy();
		});
	});
}
