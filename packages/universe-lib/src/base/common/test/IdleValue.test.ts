import * as assert from 'assert';

import { IdleValue, wait } from '../async';

suite('IdleValue', () => {
	test('should execute the executor function lazily', () => {
		let didRun = false;
		const idleValue = new IdleValue(() => {
			didRun = true;
			return 42;
		});

		assert.strictEqual(didRun, false);
		assert.strictEqual(idleValue.isInitialized, false);
		assert.strictEqual(idleValue.value, 42);
		assert.strictEqual(didRun, true);
	});

	test('should dispose the handle when the value is initialized', () => {
		const idleValue = new IdleValue(() => 42);

		assert.strictEqual(idleValue.isInitialized, false);
		assert.strictEqual(idleValue.value, 42);
		assert.strictEqual(idleValue.isInitialized, true);
	});

	test('should throw an error if the executor function throws an error', () => {
		const error = new Error('executor error');
		const idleValue = new IdleValue(() => {
			throw error;
		});

		assert.throws(() => {
			idleValue.value;
		}, error);
	});

	test('should return the same value on subsequent calls', () => {
		let count = 0;
		const idleValue = new IdleValue(() => {
			count++;
			return count;
		});

		assert.strictEqual(idleValue.value, 1);
		assert.strictEqual(idleValue.value, 1);
		assert.strictEqual(idleValue.value, 1);
		assert.strictEqual(idleValue.isInitialized, true);
	});

	test('should execute while idle', async () => {
		// 在空闲的时候会自动执行
		let didRun = false;
		const idleValue = new IdleValue(() => {
			didRun = true;
			return 42;
		});

		assert.strictEqual(didRun, false);
		assert.strictEqual(idleValue.isInitialized, false);
		await wait(0);
		assert.strictEqual(didRun, true);
		assert.strictEqual(idleValue.isInitialized, true);
	});
});
