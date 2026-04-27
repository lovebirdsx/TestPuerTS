import * as assert from 'assert';
import { getValueByJsonPath, setValueByJsonPath } from '../json';

suite('types', () => {
	test('getValueByPath', () => {
		const foo = {
			bar: {
				baz: 42,
			},
			arr: [1, 2, 3],
		};
		assert.strictEqual(getValueByJsonPath(foo, ['bar', 'baz']), 42);
		assert.strictEqual(getValueByJsonPath(foo, ['arr', '0']), 1);
		assert.strictEqual(getValueByJsonPath(foo, ['arr', '1']), 2);
	});

	test('setValueByPath', () => {
		const foo = {
			bar: {
				baz: 42,
			},
			arr: [1, 2, 3],
		};

		setValueByJsonPath(foo, ['bar', 'baz'], 1337);
		assert.strictEqual(foo.bar.baz, 1337);

		setValueByJsonPath(foo, ['arr', '0'], 4);
		assert.strictEqual(foo.arr[0], 4);

		// 直接设定根内容
		setValueByJsonPath(foo, [], { bar: 'world' });
		assert.strictEqual(foo.bar, 'world');
	});
});
