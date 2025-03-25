import * as assert from 'assert';
import { $Nullable, toDelegate } from 'puerts';
import * as ue from 'ue';

suite('Actor', () => {
	test('basic', () => {
		ue.EditorCommonLibrary.TempWorldTest_EditorOnly(
			toDelegate(undefined, (world: $Nullable<ue.World>) => {
				const actor = ue.GameplayStatics.BeginDeferredActorSpawnFromClass(world, ue.MainActor.StaticClass(), undefined);
				ue.GameplayStatics.FinishSpawningActor(actor, undefined);

				assert.ok(actor != undefined);
				assert.ok(actor.GetName().startsWith('MainActor'));
				assert.strictEqual(actor.K2_GetActorLocation().ToString(), 'X=0.000 Y=0.000 Z=0.000');

				actor.K2_DestroyActor();
			}),
		);
	});
});
