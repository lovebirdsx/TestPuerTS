import { describe, it, expect } from 'vitest';

import { applyDiff, createDiff, stableStringify } from '../json';

describe('Json', () => {
	describe('stableStringify', () => {
		// 字段排序
		it('simple', () => {
			const obj = { a: 1, b: 2, c: 3 };
			const base = { b: 2, a: 1, c: 3 };
			const result = stableStringify(obj, base);
			expect(result).toBe('{"b":2,"a":1,"c":3}');
		});

		// base为空
		it('empty base', () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = stableStringify(obj, {} as any);
			expect(result).toBe('{"a":1,"b":2,"c":3}');
		});

		// 类型不一样
		it('different type', () => {
			const obj = { a: { id: 1 } };
			const base = {};
			const result = stableStringify(obj, base);
			expect(result).toBe('{"a":{"id":1}}');
		});

		// 嵌套
		it('nested', () => {
			const obj = { a: 1, b: { c: 2, d: 3 } };
			const base = { b: { d: 3, c: 2 }, a: 1 };
			const result = stableStringify(obj, base);
			expect(result).toBe('{"b":{"d":3,"c":2},"a":1}');
		});

		// 普通数组
		it('array', () => {
			const obj = [1, 2, 3];
			const base = [2, 1, 3];
			const result = stableStringify(obj, base);
			expect(result).toBe('[1,2,3]');
		});

		// Object类型数组
		it('object array', () => {
			const obj = [
				{ b: 2, a: 1 },
				{ b: 4, a: 3 },
			];
			const base = [{ a: 1, b: 2 }];
			const result = stableStringify(obj, base);
			expect(result).toBe('[{"a":1,"b":2},{"a":3,"b":4}]');
		});

		// base为空object数据
		it('empty base object array', () => {
			const obj = [{ a: 1, b: 2, c: 3 }];
			const result = stableStringify(obj, []);
			expect(result).toBe('[{"a":1,"b":2,"c":3}]');
		});
	});

	it('create diff', () => {
		// 普通
		expect(createDiff({ A: 1 }, undefined)).toEqual({ A: 1 });
		expect(createDiff(undefined, { A: 1 })).toEqual(null);
		expect(createDiff(undefined, 1)).toEqual(null);
		expect(createDiff(undefined, undefined)).toEqual(undefined);
		expect(createDiff({}, { A: 1 })).toEqual({ A: null });
		expect(createDiff({ A: 1 }, { A: 1 })).toEqual(undefined);
		expect(createDiff({ A: 1 }, { A: 1, B: 2 })).toEqual({ B: null });
		expect(createDiff({ A: 0 }, { A: 1 })).toEqual({ A: 0 });
		expect(createDiff({ A: 1, B: 1 }, { A: 1 })).toEqual({ B: 1 });
		expect(createDiff({ A: false }, { A: 1 })).toEqual({ A: false });
		expect(createDiff({ A: false }, { A: [1, 2] })).toEqual({ A: false });
		expect(createDiff({ A: false }, { A: { A: 1 } })).toEqual({ A: false });
		expect(createDiff({ A: [1, 2] }, { A: [1, 2] })).toEqual(undefined);
		expect(createDiff({ A: [{ B: 1 }, { B: 2 }] }, { A: [{ B: 1 }, { B: 2 }] })).toEqual(undefined);
		expect(createDiff({ E: { C: { Vars: [{ B: 1 }] } } }, { E: { C: { Vars: [{ B: 1 }] } } })).toEqual(undefined);

		// 数组
		expect(createDiff([{ A: 1 }, { A: 3 }], [{ A: 1 }, { A: 2 }])).toEqual([{ A: 1 }, { A: 3 }]);
		expect(createDiff([{ A: 1 }, { A: 2 }, { A: 3 }], [{ A: 1 }, { A: 2 }, { A: 3 }])).toEqual(undefined);
		expect(createDiff([1, 2, 3], [1, 2, 3])).toEqual(undefined);
		expect(createDiff(undefined, [1, 2, 3])).toEqual(null);
		expect(createDiff([1, 2], [1, 2, 3])).toEqual([1, 2]);

		// 嵌套
		expect(createDiff({ A: { B: 1 } }, { A: { B: 1 } })).toEqual(undefined);
		expect(createDiff({ A: { B: 1, C: 1 } }, { A: { B: 1 } })).toEqual({ A: { C: 1 } });
		expect(createDiff({ A: { B: 1, C: 1 } }, { A: {} })).toEqual({ A: { B: 1, C: 1 } });
	});

	it('apply diff', () => {
		// 普通
		expect(applyDiff({ A: 1 }, undefined)).toEqual({ A: 1 });
		expect(applyDiff(undefined, { A: 1 })).toEqual({ A: 1 });
		expect(applyDiff(undefined, undefined)).toEqual(undefined);
		expect(applyDiff(null, { A: 1 })).toEqual(undefined);
		expect(applyDiff({ A: null }, { A: 1 })).toEqual({});
		expect(applyDiff({ A: 0 }, { A: 1 })).toEqual({ A: 0 });
		expect(applyDiff({ B: 1 }, { A: 1, B: 1 })).toEqual({ A: 1, B: 1 });
		expect(applyDiff({ A: false }, { A: 1 })).toEqual({ A: false });
		expect(applyDiff({ A: false }, { A: [1, 2] })).toEqual({ A: false });
		expect(applyDiff({ A: false }, { A: { A: 1 } })).toEqual({ A: false });

		// 嵌套
		expect(applyDiff(undefined, { A: { B: 1 } })).toEqual({ A: { B: 1 } });
		expect(applyDiff({ A: { C: 1 } }, { A: { B: 1 } })).toEqual({ A: { B: 1, C: 1 } });
		expect(applyDiff({ A: { B: 1, C: 1 } }, { A: {} })).toEqual({ A: { B: 1, C: 1 } });

		// 数组
		expect(applyDiff([0], undefined)).toEqual([0]);
		expect(applyDiff(undefined, [0])).toEqual([0]);
		expect(applyDiff(null, [0])).toEqual(undefined);
		expect(applyDiff([0], [1, 2])).toEqual([0]);

		// 模版中没有字段，实体中对应的字段为null
		expect(applyDiff({ B: null }, {})).toEqual({});

		// 实体中有多余的object字段，且该object中包含值为null的field
		// 解压之后，多余object中的 null field应该被删除
		expect(applyDiff({ A: { A1: 'ok', A2: null }, B: 1 }, { B: 1 })).toEqual({ A: { A1: 'ok' }, B: 1 });
	});

	it('apply diff bug', () => {
		const aWithNull = { OnActions: [{}, null] };
		const aWithUndefined = { OnActions: [{}, undefined] };
		const b = { OnActions: [{}, { Name: 'Invoke' }] };

		expect(() => {
			applyDiff(aWithNull, b);
		}).not.toThrow();

		expect(() => {
			applyDiff(aWithUndefined, b);
		}).not.toThrow();
	});
});
