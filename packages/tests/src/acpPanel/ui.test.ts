import { describe, expect, it } from '../testRunner';
import { createTestStore, waitHydration } from './testStore';

describe('AcpPanel store / ui', () => {
	it('activeDrawer defaults to undefined', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		expect(ctx.store.getState().activeDrawer).toBe(undefined);
	});

	it('setActiveDrawer assigns a key, undefined clears it', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().setActiveDrawer('settings');
		expect(ctx.store.getState().activeDrawer).toBe('settings');
		ctx.store.getState().setActiveDrawer(undefined);
		expect(ctx.store.getState().activeDrawer).toBe(undefined);
	});

	it('toggleDrawer opens then closes the same key', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().toggleDrawer('history');
		expect(ctx.store.getState().activeDrawer).toBe('history');
		ctx.store.getState().toggleDrawer('history');
		expect(ctx.store.getState().activeDrawer).toBe(undefined);
	});

	it('toggleDrawer switches between different keys', async () => {
		const ctx = createTestStore();
		await waitHydration(ctx.store);
		ctx.store.getState().toggleDrawer('history');
		ctx.store.getState().toggleDrawer('settings');
		expect(ctx.store.getState().activeDrawer).toBe('settings');
		ctx.store.getState().toggleDrawer('history');
		expect(ctx.store.getState().activeDrawer).toBe('history');
	});
});
