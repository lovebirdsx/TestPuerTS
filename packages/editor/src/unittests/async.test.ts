import * as ue from 'ue';
import * as assert from 'assert';

export function waitLatentActionState(state: ue.LatentActionState): Promise<void> {
	return new Promise<void>((resolve, _reject) => {
		state.LatentActionCallback.Bind(() => {
			state.LatentActionCallback.Unbind();
			resolve();
		});
	});
}

export function asyncLoad(path: string): Promise<ue.Class> {
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

suite('Async', () => {
	test('latent action', async () => {
		const actionState = new ue.LatentActionState();
		const world = ue.EditorCommonLibrary.GetWorld_EditorOnly();
		assert.ok(world !== undefined);
		ue.KismetSystemLibrary.Delay(world, 0.001, actionState.GetLatentActionInfo());
		await waitLatentActionState(actionState);
	});

	test('async load', async () => {
		const path = '/Game/Editor/B_Object.B_Object_C';
		const cls = await asyncLoad(path);
		assert.ok(cls !== undefined);
	});
});
