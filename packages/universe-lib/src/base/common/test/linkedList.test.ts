import { beforeEach } from 'vitest';
import { LinkedList } from '../linkedList';
import * as assert from 'assert';

suite('LinkedList', () => {
	let list: LinkedList<number>;

	beforeEach(() => {
		list = new LinkedList<number>();
	});

	test('should initialize with size 0', () => {
		assert.strictEqual(list.size, 0);
	});

	test('should be empty when initialized', () => {
		assert.strictEqual(list.isEmpty(), true);
	});

	test('should add elements to the front of the list', () => {
		list.unshift(1);
		list.unshift(2);
		list.unshift(3);

		assert.strictEqual(list.size, 3);
		assert.deepStrictEqual([...list], [3, 2, 1]);
	});

	test('should add elements to the end of the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		assert.strictEqual(list.size, 3);
		assert.deepStrictEqual([...list], [1, 2, 3]);
	});

	test('should remove elements from the front of the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		assert.strictEqual(list.shift(), 1);
		assert.strictEqual(list.shift(), 2);
		assert.strictEqual(list.shift(), 3);
		assert.strictEqual(list.shift(), undefined);
		assert.strictEqual(list.size, 0);
		assert.deepStrictEqual([...list], []);
	});

	test('should remove elements from the end of the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		assert.strictEqual(list.pop(), 3);
		assert.strictEqual(list.pop(), 2);
		assert.strictEqual(list.pop(), 1);
		assert.strictEqual(list.pop(), undefined);
		assert.strictEqual(list.size, 0);
		assert.deepStrictEqual([...list], []);
	});

	test('should clear the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		assert.strictEqual(list.size, 3);
		assert.deepStrictEqual([...list], [1, 2, 3]);

		list.clear();

		assert.strictEqual(list.size, 0);
		assert.deepStrictEqual([...list], []);
	});
});
