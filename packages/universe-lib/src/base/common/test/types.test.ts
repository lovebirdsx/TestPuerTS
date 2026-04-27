import { describe, it, expect } from 'vitest';
import { getValueByJsonPath, setValueByJsonPath } from '../json';

describe('types', () => {
	it('getValueByPath', () => {
		const foo = {
			bar: {
				baz: 42,
			},
			arr: [1, 2, 3],
		};
		expect(getValueByJsonPath(foo, ['bar', 'baz'])).toBe(42);
		expect(getValueByJsonPath(foo, ['arr', '0'])).toBe(1);
		expect(getValueByJsonPath(foo, ['arr', '1'])).toBe(2);
	});

	it('setValueByPath', () => {
		const foo = {
			bar: {
				baz: 42,
			},
			arr: [1, 2, 3],
		};

		setValueByJsonPath(foo, ['bar', 'baz'], 1337);
		expect(foo.bar.baz).toBe(1337);

		setValueByJsonPath(foo, ['arr', '0'], 4);
		expect(foo.arr[0]).toBe(4);

		// 直接设定根内容
		setValueByJsonPath(foo, [], { bar: 'world' });
		expect(foo.bar).toBe('world');
	});
});
