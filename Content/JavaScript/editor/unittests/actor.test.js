"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const puerts_1 = require("puerts");
const ue = require("ue");
suite('Actor', () => {
    test('basic', () => {
        ue.EditorCommonLibrary.TempWorldTest_EditorOnly((0, puerts_1.toDelegate)(undefined, (world) => {
            const actor = ue.GameplayStatics.BeginDeferredActorSpawnFromClass(world, ue.MainActor.StaticClass(), undefined);
            ue.GameplayStatics.FinishSpawningActor(actor, undefined);
            assert.ok(actor != undefined);
            assert.ok(actor.GetName().startsWith('MainActor'));
            assert.strictEqual(actor.K2_GetActorLocation().ToString(), 'X=0.000 Y=0.000 Z=0.000');
            actor.K2_DestroyActor();
        }));
    });
});
//# sourceMappingURL=actor.test.js.map