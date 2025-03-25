"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitLatentActionState = waitLatentActionState;
exports.asyncLoad = asyncLoad;
const ue = require("ue");
const assert = require("assert");
function waitLatentActionState(state) {
    return new Promise((resolve, _reject) => {
        state.LatentActionCallback.Bind(() => {
            state.LatentActionCallback.Unbind();
            resolve();
        });
    });
}
function asyncLoad(path) {
    return new Promise((resolve, reject) => {
        const asyncLoadObj = new ue.AsyncLoadState();
        asyncLoadObj.LoadedCallback.Bind((cls) => {
            asyncLoadObj.LoadedCallback.Unbind();
            if (cls) {
                resolve(cls);
            }
            else {
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
//# sourceMappingURL=async.test.js.map