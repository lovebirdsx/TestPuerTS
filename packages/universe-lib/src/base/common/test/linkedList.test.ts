import { describe, it, beforeEach, expect } from 'vitest';
import { LinkedList } from '../linkedList';

describe('LinkedList', () => {
	let list: LinkedList<number>;

	beforeEach(() => {
		list = new LinkedList<number>();
	});

	it('should initialize with size 0', () => {
		expect(list.size).toBe(0);
	});

	it('should be empty when initialized', () => {
		expect(list.isEmpty()).toBe(true);
	});

	it('should add elements to the front of the list', () => {
		list.unshift(1);
		list.unshift(2);
		list.unshift(3);

		expect(list.size).toBe(3);
		expect([...list]).toEqual([3, 2, 1]);
	});

	it('should add elements to the end of the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		expect(list.size).toBe(3);
		expect([...list]).toEqual([1, 2, 3]);
	});

	it('should remove elements from the front of the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		expect(list.shift()).toBe(1);
		expect(list.shift()).toBe(2);
		expect(list.shift()).toBe(3);
		expect(list.shift()).toBe(undefined);
		expect(list.size).toBe(0);
		expect([...list]).toEqual([]);
	});

	it('should remove elements from the end of the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		expect(list.pop()).toBe(3);
		expect(list.pop()).toBe(2);
		expect(list.pop()).toBe(1);
		expect(list.pop()).toBe(undefined);
		expect(list.size).toBe(0);
		expect([...list]).toEqual([]);
	});

	it('should clear the list', () => {
		list.push(1);
		list.push(2);
		list.push(3);

		expect(list.size).toBe(3);
		expect([...list]).toEqual([1, 2, 3]);

		list.clear();

		expect(list.size).toBe(0);
		expect([...list]).toEqual([]);
	});
});
