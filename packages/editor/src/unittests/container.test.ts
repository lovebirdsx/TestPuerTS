import * as assert from 'assert';
import * as ue from 'ue';

suite('Container', () => {
	test('fix size array', () => {
		const obj = new ue.MainObject();
		const arr = obj.MyFixSizeArray;
		assert.strictEqual(arr.Num(), 100);
		assert.strictEqual(arr.Get(0), 99);
		assert.strictEqual(arr.Get(99), 0);

		arr.Set(0, 100);
		assert.strictEqual(arr.Get(0), 100);
	});

	test('array', () => {
		const arr = ue.NewArray(ue.BuiltinString);
		arr.Add('a', 'b', 'c');
		assert.strictEqual(arr.Num(), 3);
		assert.strictEqual(arr.Get(0), 'a');
	});

	test('set', () => {
		const set = ue.NewSet(ue.BuiltinString);
		assert.ok(!set.Contains('a'));
		set.Add('a');
		set.Add('b');
		assert.ok(set.Contains('a'));
		assert.strictEqual(set.Num(), 2);
		set.Add('a');
		assert.strictEqual(set.Num(), 2);
		const index = set.FindIndex('a');
		set.RemoveAt(index);
		assert.strictEqual(set.Num(), 1);
	});

	test('map', () => {
		const map = ue.NewMap(ue.BuiltinString, ue.BuiltinInt);
		map.Add('a', 1);
		map.Add('b', 2);
		assert.strictEqual(map.Num(), 2);
		assert.strictEqual(map.Get('a'), 1);
		map.Set('a', 100);
		assert.strictEqual(map.Get('a'), 100);
		map.Remove('a');
		assert.strictEqual(map.Num(), 1);
	});
});
