import { describe, it, expect } from 'vitest';
import { BidirectionalMap, LinkedMap, LRUCache, mapsStrictEqualIgnoreOrder, MRUCache, ResourceMap, SetMap, Touch } from '../map';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../test/utils';
import { URI } from '../uri';
import { extUriIgnorePathCase } from '../resources';

describe('Map', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	it('LinkedMap - Simple', () => {
		const map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('bk', 'bv');
		expect([...map.keys()]).toEqual(['ak', 'bk']);
		expect([...map.values()]).toEqual(['av', 'bv']);
		expect(map.first).toBe('av');
		expect(map.last).toBe('bv');
	});

	it('LinkedMap - Touch Old one', () => {
		const map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('ak', 'av', Touch.AsOld);
		expect([...map.keys()]).toEqual(['ak']);
		expect([...map.values()]).toEqual(['av']);
	});

	it('LinkedMap - Touch New one', () => {
		const map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('ak', 'av', Touch.AsNew);
		expect([...map.keys()]).toEqual(['ak']);
		expect([...map.values()]).toEqual(['av']);
	});

	it('LinkedMap - Touch Old two', () => {
		const map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('bk', 'bv');
		map.set('bk', 'bv', Touch.AsOld);
		expect([...map.keys()]).toEqual(['bk', 'ak']);
		expect([...map.values()]).toEqual(['bv', 'av']);
	});

	it('LinkedMap - Touch New two', () => {
		const map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('bk', 'bv');
		map.set('ak', 'av', Touch.AsNew);
		expect([...map.keys()]).toEqual(['bk', 'ak']);
		expect([...map.values()]).toEqual(['bv', 'av']);
	});

	it('LinkedMap - Touch Old from middle', () => {
		const map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('bk', 'bv');
		map.set('ck', 'cv');
		map.set('bk', 'bv', Touch.AsOld);
		expect([...map.keys()]).toEqual(['bk', 'ak', 'ck']);
		expect([...map.values()]).toEqual(['bv', 'av', 'cv']);
	});

	it('LinkedMap - Touch New from middle', () => {
		const map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('bk', 'bv');
		map.set('ck', 'cv');
		map.set('bk', 'bv', Touch.AsNew);
		expect([...map.keys()]).toEqual(['ak', 'ck', 'bk']);
		expect([...map.values()]).toEqual(['av', 'cv', 'bv']);
	});

	it('LinkedMap - basics', function () {
		const map = new LinkedMap<string, any>();

		expect(map.size).toBe(0);

		map.set('1', 1);
		map.set('2', '2');
		map.set('3', true);

		const obj = Object.create(null);
		map.set('4', obj);

		const date = Date.now();
		map.set('5', date);

		expect(map.size).toBe(5);
		expect(map.get('1')).toBe(1);
		expect(map.get('2')).toBe('2');
		expect(map.get('3')).toBe(true);
		expect(map.get('4')).toBe(obj);
		expect(map.get('5')).toBe(date);
		expect(map.get('6')).toBeFalsy();

		map.delete('6');
		expect(map.size).toBe(5);
		expect(map.delete('1')).toBe(true);
		expect(map.delete('2')).toBe(true);
		expect(map.delete('3')).toBe(true);
		expect(map.delete('4')).toBe(true);
		expect(map.delete('5')).toBe(true);

		expect(map.size).toBe(0);
		expect(map.get('5')).toBeFalsy();
		expect(map.get('4')).toBeFalsy();
		expect(map.get('3')).toBeFalsy();
		expect(map.get('2')).toBeFalsy();
		expect(map.get('1')).toBeFalsy();

		map.set('1', 1);
		map.set('2', '2');
		map.set('3', true);

		expect(map.has('1')).toBeTruthy();
		expect(map.get('1')).toBe(1);
		expect(map.get('2')).toBe('2');
		expect(map.get('3')).toBe(true);

		map.clear();

		expect(map.size).toBe(0);
		expect(map.get('1')).toBeFalsy();
		expect(map.get('2')).toBeFalsy();
		expect(map.get('3')).toBeFalsy();
		expect(map.has('1')).toBeFalsy();
	});

	it('LinkedMap - Iterators', () => {
		const map = new LinkedMap<number, any>();
		map.set(1, 1);
		map.set(2, 2);
		map.set(3, 3);

		for (const elem of map.keys()) {
			expect(elem).toBeTruthy();
		}

		for (const elem of map.values()) {
			expect(elem).toBeTruthy();
		}

		for (const elem of map.entries()) {
			expect(elem).toBeTruthy();
		}

		{
			const keys = map.keys();
			const values = map.values();
			const entries = map.entries();
			map.get(1);
			keys.next();
			values.next();
			entries.next();
		}

		{
			const keys = map.keys();
			const values = map.values();
			const entries = map.entries();
			map.get(1, Touch.AsNew);

			let exceptions: number = 0;
			try {
				keys.next();
			} catch (_err) {
				exceptions++;
			}
			try {
				values.next();
			} catch (_err) {
				exceptions++;
			}
			try {
				entries.next();
			} catch (_err) {
				exceptions++;
			}

			expect(exceptions).toBe(3);
		}
	});

	it('LinkedMap - LRU Cache simple', () => {
		const cache = new LRUCache<number, number>(5);

		[1, 2, 3, 4, 5].forEach((value) => cache.set(value, value));
		expect(cache.size).toBe(5);
		cache.set(6, 6);
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([2, 3, 4, 5, 6]);
		cache.set(7, 7);
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([3, 4, 5, 6, 7]);
		const values: number[] = [];
		[3, 4, 5, 6, 7].forEach((key) => values.push(cache.get(key)!));
		expect(values).toEqual([3, 4, 5, 6, 7]);
	});

	it('LinkedMap - LRU Cache get', () => {
		const cache = new LRUCache<number, number>(5);

		[1, 2, 3, 4, 5].forEach((value) => cache.set(value, value));
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([1, 2, 3, 4, 5]);
		cache.get(3);
		expect([...cache.keys()]).toEqual([1, 2, 4, 5, 3]);
		cache.peek(4);
		expect([...cache.keys()]).toEqual([1, 2, 4, 5, 3]);
		const values: number[] = [];
		[1, 2, 3, 4, 5].forEach((key) => values.push(cache.get(key)!));
		expect(values).toEqual([1, 2, 3, 4, 5]);
	});

	it('LinkedMap - LRU Cache limit', () => {
		const cache = new LRUCache<number, number>(10);

		for (let i = 1; i <= 10; i++) {
			cache.set(i, i);
		}
		expect(cache.size).toBe(10);
		cache.limit = 5;
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([6, 7, 8, 9, 10]);
		cache.limit = 20;
		expect(cache.size).toBe(5);
		for (let i = 11; i <= 20; i++) {
			cache.set(i, i);
		}
		expect(cache.size).toEqual(15);
		const values: number[] = [];
		for (let i = 6; i <= 20; i++) {
			values.push(cache.get(i)!);
			expect(cache.get(i)).toBe(i);
		}
		expect([...cache.values()]).toEqual(values);
	});

	it('LinkedMap - LRU Cache limit with ratio', () => {
		const cache = new LRUCache<number, number>(10, 0.5);

		for (let i = 1; i <= 10; i++) {
			cache.set(i, i);
		}
		expect(cache.size).toBe(10);
		cache.set(11, 11);
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([7, 8, 9, 10, 11]);
		const values: number[] = [];
		[...cache.keys()].forEach((key) => values.push(cache.get(key)!));
		expect(values).toEqual([7, 8, 9, 10, 11]);
		expect([...cache.values()]).toEqual(values);
	});

	it('LinkedMap - MRU Cache simple', () => {
		const cache = new MRUCache<number, number>(5);

		[1, 2, 3, 4, 5].forEach((value) => cache.set(value, value));
		expect(cache.size).toBe(5);
		cache.set(6, 6);
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([1, 2, 3, 4, 6]);
		cache.set(7, 7);
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([1, 2, 3, 4, 7]);
		const values: number[] = [];
		[1, 2, 3, 4, 7].forEach((key) => values.push(cache.get(key)!));
		expect(values).toEqual([1, 2, 3, 4, 7]);
	});

	it('LinkedMap - MRU Cache get', () => {
		const cache = new MRUCache<number, number>(5);

		[1, 2, 3, 4, 5].forEach((value) => cache.set(value, value));
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([1, 2, 3, 4, 5]);
		cache.get(3);
		expect([...cache.keys()]).toEqual([1, 2, 4, 5, 3]);
		cache.peek(4);
		expect([...cache.keys()]).toEqual([1, 2, 4, 5, 3]);
		const values: number[] = [];
		[1, 2, 3, 4, 5].forEach((key) => values.push(cache.get(key)!));
		expect(values).toEqual([1, 2, 3, 4, 5]);
	});

	it('LinkedMap - MRU Cache limit with ratio', () => {
		const cache = new MRUCache<number, number>(10, 0.5);

		for (let i = 1; i <= 10; i++) {
			cache.set(i, i);
		}
		expect(cache.size).toBe(10);
		cache.set(11, 11);
		expect(cache.size).toBe(5);
		expect([...cache.keys()]).toEqual([1, 2, 3, 4, 11]);
		const values: number[] = [];
		[...cache.keys()].forEach((key) => values.push(cache.get(key)!));
		expect(values).toEqual([1, 2, 3, 4, 11]);
		expect([...cache.values()]).toEqual(values);
	});

	it('LinkedMap - toJSON / fromJSON', () => {
		let map = new LinkedMap<string, string>();
		map.set('ak', 'av');
		map.set('bk', 'bv');
		map.set('ck', 'cv');

		const json = map.toJSON();
		map = new LinkedMap<string, string>();
		map.fromJSON(json);

		let i = 0;
		map.forEach((value, key) => {
			if (i === 0) {
				expect(key).toBe('ak');
				expect(value).toBe('av');
			} else if (i === 1) {
				expect(key).toBe('bk');
				expect(value).toBe('bv');
			} else if (i === 2) {
				expect(key).toBe('ck');
				expect(value).toBe('cv');
			}
			i++;
		});
	});

	it('LinkedMap - delete Head and Tail', function () {
		const map = new LinkedMap<string, number>();

		expect(map.size).toBe(0);

		map.set('1', 1);
		expect(map.size).toBe(1);
		map.delete('1');
		expect(map.get('1')).toBe(undefined);
		expect(map.size).toBe(0);
		expect([...map.keys()].length).toBe(0);
	});

	it('LinkedMap - delete Head', function () {
		const map = new LinkedMap<string, number>();

		expect(map.size).toBe(0);

		map.set('1', 1);
		map.set('2', 2);
		expect(map.size).toBe(2);
		map.delete('1');
		expect(map.get('2')).toBe(2);
		expect(map.size).toBe(1);
		expect([...map.keys()].length).toBe(1);
		expect([...map.keys()][0]).toBe('2');
	});

	it('LinkedMap - delete Tail', function () {
		const map = new LinkedMap<string, number>();

		expect(map.size).toBe(0);

		map.set('1', 1);
		map.set('2', 2);
		expect(map.size).toBe(2);
		map.delete('2');
		expect(map.get('1')).toBe(1);
		expect(map.size).toBe(1);
		expect([...map.keys()].length).toBe(1);
		expect([...map.keys()][0]).toBe('1');
	});

	it('ResourceMap - basics', function () {
		const map = new ResourceMap<any>();

		const resource1 = URI.parse('some://1');
		const resource2 = URI.parse('some://2');
		const resource3 = URI.parse('some://3');
		const resource4 = URI.parse('some://4');
		const resource5 = URI.parse('some://5');
		const resource6 = URI.parse('some://6');

		expect(map.size).toBe(0);

		const res = map.set(resource1, 1);
		expect(res).toBe(map);
		map.set(resource2, '2');
		map.set(resource3, true);

		const values = [...map.values()];
		expect(values[0]).toBe(1);
		expect(values[1]).toBe('2');
		expect(values[2]).toBe(true);

		let counter = 0;
		map.forEach((value, key, mapObj) => {
			expect(value).toBe(values[counter++]);
			expect(URI.isUri(key)).toBeTruthy();
			expect(map).toBe(mapObj);
		});

		const obj = Object.create(null);
		map.set(resource4, obj);

		const date = Date.now();
		map.set(resource5, date);

		expect(map.size).toBe(5);
		expect(map.get(resource1)).toBe(1);
		expect(map.get(resource2)).toBe('2');
		expect(map.get(resource3)).toBe(true);
		expect(map.get(resource4)).toBe(obj);
		expect(map.get(resource5)).toBe(date);
		expect(map.get(resource6)).toBeFalsy();

		map.delete(resource6);
		expect(map.size).toBe(5);
		expect(map.delete(resource1)).toBeTruthy();
		expect(map.delete(resource2)).toBeTruthy();
		expect(map.delete(resource3)).toBeTruthy();
		expect(map.delete(resource4)).toBeTruthy();
		expect(map.delete(resource5)).toBeTruthy();

		expect(map.size).toBe(0);
		expect(map.get(resource5)).toBeFalsy();
		expect(map.get(resource4)).toBeFalsy();
		expect(map.get(resource3)).toBeFalsy();
		expect(map.get(resource2)).toBeFalsy();
		expect(map.get(resource1)).toBeFalsy();

		map.set(resource1, 1);
		map.set(resource2, '2');
		map.set(resource3, true);

		expect(map.has(resource1)).toBeTruthy();
		expect(map.get(resource1)).toBe(1);
		expect(map.get(resource2)).toBe('2');
		expect(map.get(resource3)).toBe(true);

		map.clear();

		expect(map.size).toBe(0);
		expect(map.get(resource1)).toBeFalsy();
		expect(map.get(resource2)).toBeFalsy();
		expect(map.get(resource3)).toBeFalsy();
		expect(map.has(resource1)).toBeFalsy();

		map.set(resource1, false);
		map.set(resource2, 0);

		expect(map.has(resource1)).toBeTruthy();
		expect(map.has(resource2)).toBeTruthy();
	});

	it('ResourceMap - files (do NOT ignorecase)', function () {
		const map = new ResourceMap<any>();

		const fileA = URI.parse('file://some/filea');
		const fileB = URI.parse('some://some/other/fileb');
		const fileAUpper = URI.parse('file://SOME/FILEA');

		map.set(fileA, 'true');
		expect(map.get(fileA)).toBe('true');

		expect(map.get(fileAUpper)).toBeFalsy();

		expect(map.get(fileB)).toBeFalsy();

		map.set(fileAUpper, 'false');
		expect(map.get(fileAUpper)).toBe('false');

		expect(map.get(fileA)).toBe('true');

		const windowsFile = URI.file('c:\\test with %25\\c#code');
		const uncFile = URI.file('\\\\shäres\\path\\c#\\plugin.json');

		map.set(windowsFile, 'true');
		map.set(uncFile, 'true');

		expect(map.get(windowsFile)).toBe('true');
		expect(map.get(uncFile)).toBe('true');
	});

	it('ResourceMap - files (ignorecase)', function () {
		const map = new ResourceMap<any>((uri) => extUriIgnorePathCase.getComparisonKey(uri));

		const fileA = URI.parse('file://some/filea');
		const fileB = URI.parse('some://some/other/fileb');
		const fileAUpper = URI.parse('file://SOME/FILEA');

		map.set(fileA, 'true');
		expect(map.get(fileA)).toBe('true');

		expect(map.get(fileAUpper)).toBe('true');

		expect(map.get(fileB)).toBeFalsy();

		map.set(fileAUpper, 'false');
		expect(map.get(fileAUpper)).toBe('false');

		expect(map.get(fileA)).toBe('false');

		const windowsFile = URI.file('c:\\test with %25\\c#code');
		const uncFile = URI.file('\\\\shäres\\path\\c#\\plugin.json');

		map.set(windowsFile, 'true');
		map.set(uncFile, 'true');

		expect(map.get(windowsFile)).toBe('true');
		expect(map.get(uncFile)).toBe('true');
	});

	it('ResourceMap - files (ignorecase, BUT preservecase)', function () {
		const map = new ResourceMap<number>((uri) => extUriIgnorePathCase.getComparisonKey(uri));

		const fileA = URI.parse('file://some/filea');
		const fileAUpper = URI.parse('file://SOME/FILEA');

		map.set(fileA, 1);
		expect(map.get(fileA)).toBe(1);
		expect(map.get(fileAUpper)).toBe(1);
		expect(Array.from(map.keys()).map(String)).toEqual([fileA].map(String));
		expect(Array.from(map)).toEqual([[fileA, 1]]);

		map.set(fileAUpper, 1);
		expect(map.get(fileA)).toBe(1);
		expect(map.get(fileAUpper)).toBe(1);
		expect(Array.from(map.keys()).map(String)).toEqual([fileAUpper].map(String));
		expect(Array.from(map)).toEqual([[fileAUpper, 1]]);
	});

	it('mapsStrictEqualIgnoreOrder', () => {
		const map1 = new Map();
		const map2 = new Map();

		expect(mapsStrictEqualIgnoreOrder(map1, map2)).toBe(true);

		map1.set('foo', 'bar');
		expect(mapsStrictEqualIgnoreOrder(map1, map2)).toBe(false);

		map2.set('foo', 'bar');
		expect(mapsStrictEqualIgnoreOrder(map1, map2)).toBe(true);

		map2.set('bar', 'foo');
		expect(mapsStrictEqualIgnoreOrder(map1, map2)).toBe(false);

		map1.set('bar', 'foo');
		expect(mapsStrictEqualIgnoreOrder(map1, map2)).toBe(true);
	});
});

describe('BidirectionalMap', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	it('should set and get values correctly', () => {
		const map = new BidirectionalMap<string, number>();
		map.set('one', 1);
		map.set('two', 2);
		map.set('three', 3);

		expect(map.get('one')).toBe(1);
		expect(map.get('two')).toBe(2);
		expect(map.get('three')).toBe(3);
	});

	it('should get keys by value correctly', () => {
		const map = new BidirectionalMap<string, number>();
		map.set('one', 1);
		map.set('two', 2);
		map.set('three', 3);

		expect(map.getKey(1)).toBe('one');
		expect(map.getKey(2)).toBe('two');
		expect(map.getKey(3)).toBe('three');
	});

	it('should delete values correctly', () => {
		const map = new BidirectionalMap<string, number>();
		map.set('one', 1);
		map.set('two', 2);
		map.set('three', 3);

		expect(map.delete('one')).toBe(true);
		expect(map.get('one')).toBe(undefined);
		expect(map.getKey(1)).toBe(undefined);

		expect(map.delete('two')).toBe(true);
		expect(map.get('two')).toBe(undefined);
		expect(map.getKey(2)).toBe(undefined);

		expect(map.delete('three')).toBe(true);
		expect(map.get('three')).toBe(undefined);
		expect(map.getKey(3)).toBe(undefined);
	});

	it('should handle non-existent keys correctly', () => {
		const map = new BidirectionalMap<string, number>();
		map.set('one', 1);
		map.set('two', 2);
		map.set('three', 3);

		expect(map.get('four')).toBe(undefined);
		expect(map.getKey(4)).toBe(undefined);
		expect(map.delete('four')).toBe(false);
	});

	it('should handle forEach correctly', () => {
		const map = new BidirectionalMap<string, number>();
		map.set('one', 1);
		map.set('two', 2);
		map.set('three', 3);

		const keys: string[] = [];
		const values: number[] = [];
		map.forEach((value, key) => {
			keys.push(key);
			values.push(value);
		});

		expect(keys).toEqual(['one', 'two', 'three']);
		expect(values).toEqual([1, 2, 3]);
	});

	it('should handle clear correctly', () => {
		const map = new BidirectionalMap<string, number>();
		map.set('one', 1);
		map.set('two', 2);
		map.set('three', 3);

		map.clear();

		expect(map.get('one')).toBe(undefined);
		expect(map.get('two')).toBe(undefined);
		expect(map.get('three')).toBe(undefined);
		expect(map.getKey(1)).toBe(undefined);
		expect(map.getKey(2)).toBe(undefined);
		expect(map.getKey(3)).toBe(undefined);
	});
});

describe('SetMap', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	it('add and get', () => {
		const setMap = new SetMap<string, number>();
		setMap.add('a', 1);
		setMap.add('a', 2);
		setMap.add('b', 3);
		expect([...setMap.get('a')]).toEqual([1, 2]);
		expect([...setMap.get('b')]).toEqual([3]);
	});

	it('delete', () => {
		const setMap = new SetMap<string, number>();
		setMap.add('a', 1);
		setMap.add('a', 2);
		setMap.add('b', 3);
		setMap.delete('a', 1);
		expect([...setMap.get('a')]).toEqual([2]);
		setMap.delete('a', 2);
		expect([...setMap.get('a')]).toEqual([]);
	});

	it('forEach', () => {
		const setMap = new SetMap<string, number>();
		setMap.add('a', 1);
		setMap.add('a', 2);
		setMap.add('b', 3);
		let sum = 0;
		setMap.forEach('a', (value) => (sum += value));
		expect(sum).toBe(3);
	});

	it('get empty set', () => {
		const setMap = new SetMap<string, number>();
		expect([...setMap.get('a')]).toEqual([]);
	});
});
