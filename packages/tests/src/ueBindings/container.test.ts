import * as ue from 'ue';
import { describe, it, expect } from '../testRunner';

describe('UeBindings > Container', () => {
	it('fix size array', () => {
		const obj = new ue.MainObject();
		const arr = obj.MyFixSizeArray;
		expect(arr.Num()).toBe(100);
		expect(arr.Get(0)).toBe(99);
		expect(arr.Get(99)).toBe(0);

		arr.Set(0, 100);
		expect(arr.Get(0)).toBe(100);
	});

	it('array', () => {
		const arr = ue.NewArray(ue.BuiltinString);
		arr.Add('a', 'b', 'c');
		expect(arr.Num()).toBe(3);
		expect(arr.Get(0)).toBe('a');
	});

	it('set', () => {
		const set = ue.NewSet(ue.BuiltinString);
		expect(set.Contains('a')).toBeFalsy();
		set.Add('a');
		set.Add('b');
		expect(set.Contains('a')).toBeTruthy();
		expect(set.Num()).toBe(2);
		set.Add('a');
		expect(set.Num()).toBe(2);
		const index = set.FindIndex('a');
		set.RemoveAt(index);
		expect(set.Num()).toBe(1);
	});

	it('map', () => {
		const map = ue.NewMap(ue.BuiltinString, ue.BuiltinInt);
		map.Add('a', 1);
		map.Add('b', 2);
		expect(map.Num()).toBe(2);
		expect(map.Get('a')).toBe(1);
		map.Set('a', 100);
		expect(map.Get('a')).toBe(100);
		map.Remove('a');
		expect(map.Num()).toBe(1);
	});
});
