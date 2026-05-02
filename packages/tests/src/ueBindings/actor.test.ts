import { $Nullable, toDelegate } from 'puerts';
import * as ue from 'ue';
import { describe, it, expect } from '../testRunner';

describe('UeBindings > Actor', () => {
	it('basic', () => {
		ue.EditorCommonLibrary.TempWorldTest(
			toDelegate(undefined, (world: $Nullable<ue.World>) => {
				const actor = ue.GameplayStatics.BeginDeferredActorSpawnFromClass(
					world,
					ue.MainActor.StaticClass(),
					undefined,
				);
				ue.GameplayStatics.FinishSpawningActor(actor, undefined);

				expect(actor !== undefined).toBeTruthy();
				expect(actor.GetName().startsWith('MainActor')).toBeTruthy();
				expect(actor.K2_GetActorLocation().ToString()).toBe('X=0.000 Y=0.000 Z=0.000');

				actor.K2_DestroyActor();
			}),
		);
	});
});
