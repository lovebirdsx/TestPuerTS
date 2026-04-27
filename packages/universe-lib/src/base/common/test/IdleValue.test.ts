import { describe, it, expect } from 'vitest';

import { IdleValue, wait } from '../async';

describe('IdleValue', () => {
	it('should execute the executor function lazily', () => {
		let didRun = false;
		const idleValue = new IdleValue(() => {
			didRun = true;
			return 42;
		});

		expect(didRun).toBe(false);
		expect(idleValue.isInitialized).toBe(false);
		expect(idleValue.value).toBe(42);
		expect(didRun).toBe(true);
	});

	it('should dispose the handle when the value is initialized', () => {
		const idleValue = new IdleValue(() => 42);

		expect(idleValue.isInitialized).toBe(false);
		expect(idleValue.value).toBe(42);
		expect(idleValue.isInitialized).toBe(true);
	});

	it('should throw an error if the executor function throws an error', () => {
		const error = new Error('executor error');
		const idleValue = new IdleValue(() => {
			throw error;
		});

		expect(() => {
			idleValue.value;
		}).toThrow('executor error');
	});

	it('should return the same value on subsequent calls', () => {
		let count = 0;
		const idleValue = new IdleValue(() => {
			count++;
			return count;
		});

		expect(idleValue.value).toBe(1);
		expect(idleValue.value).toBe(1);
		expect(idleValue.value).toBe(1);
		expect(idleValue.isInitialized).toBe(true);
	});

	it('should execute while idle', async () => {
		// 在空闲的时候会自动执行
		let didRun = false;
		const idleValue = new IdleValue(() => {
			didRun = true;
			return 42;
		});

		expect(didRun).toBe(false);
		expect(idleValue.isInitialized).toBe(false);
		await wait(0);
		expect(didRun).toBe(true);
		expect(idleValue.isInitialized).toBe(true);
	});
});
