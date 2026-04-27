import * as assert from 'assert';

import { applyDiff, createDiff, stableStringify } from '../json';

suite('Json', () => {
	suite('stableStringify', () => {
		// 字段排序
		test('simple', () => {
			const obj = { a: 1, b: 2, c: 3 };
			const base = { b: 2, a: 1, c: 3 };
			const result = stableStringify(obj, base);
			assert.strictEqual(result, '{"b":2,"a":1,"c":3}');
		});

		// base为空
		test('empty base', () => {
			const obj = { a: 1, b: 2, c: 3 };
			const result = stableStringify(obj, {} as any);
			assert.strictEqual(result, '{"a":1,"b":2,"c":3}');
		});

		// 类型不一样
		test('different type', () => {
			const obj = { a: { id: 1 } };
			const base = {};
			const result = stableStringify(obj, base);
			assert.strictEqual(result, '{"a":{"id":1}}');
		});

		// 嵌套
		test('nested', () => {
			const obj = { a: 1, b: { c: 2, d: 3 } };
			const base = { b: { d: 3, c: 2 }, a: 1 };
			const result = stableStringify(obj, base);
			assert.strictEqual(result, '{"b":{"d":3,"c":2},"a":1}');
		});

		// 普通数组
		test('array', () => {
			const obj = [1, 2, 3];
			const base = [2, 1, 3];
			const result = stableStringify(obj, base);
			assert.strictEqual(result, '[1,2,3]');
		});

		// Object类型数组
		test('object array', () => {
			const obj = [
				{ b: 2, a: 1 },
				{ b: 4, a: 3 },
			];
			const base = [{ a: 1, b: 2 }];
			const result = stableStringify(obj, base);
			assert.strictEqual(result, '[{"a":1,"b":2},{"a":3,"b":4}]');
		});

		// base为空object数据
		test('empty base object array', () => {
			const obj = [{ a: 1, b: 2, c: 3 }];
			const result = stableStringify(obj, []);
			assert.strictEqual(result, '[{"a":1,"b":2,"c":3}]');
		});
	});

	test('create diff', () => {
		// 普通
		assert.deepEqual(createDiff({ A: 1 }, undefined), { A: 1 });
		assert.deepEqual(createDiff(undefined, { A: 1 }), null);
		assert.deepEqual(createDiff(undefined, 1), null);
		assert.deepEqual(createDiff(undefined, undefined), undefined);
		assert.deepEqual(createDiff({}, { A: 1 }), { A: null });
		assert.deepEqual(createDiff({ A: 1 }, { A: 1 }), undefined);
		assert.deepEqual(createDiff({ A: 1 }, { A: 1, B: 2 }), { B: null });
		assert.deepEqual(createDiff({ A: 0 }, { A: 1 }), { A: 0 });
		assert.deepEqual(createDiff({ A: 1, B: 1 }, { A: 1 }), { B: 1 });
		assert.deepEqual(createDiff({ A: false }, { A: 1 }), { A: false });
		assert.deepEqual(createDiff({ A: false }, { A: [1, 2] }), { A: false });
		assert.deepEqual(createDiff({ A: false }, { A: { A: 1 } }), { A: false });
		assert.deepEqual(createDiff({ A: [1, 2] }, { A: [1, 2] }), undefined);
		assert.deepEqual(createDiff({ A: [{ B: 1 }, { B: 2 }] }, { A: [{ B: 1 }, { B: 2 }] }), undefined);
		assert.deepEqual(createDiff({ E: { C: { Vars: [{ B: 1 }] } } }, { E: { C: { Vars: [{ B: 1 }] } } }), undefined);

		// 数组
		assert.deepEqual(createDiff([{ A: 1 }, { A: 3 }], [{ A: 1 }, { A: 2 }]), [{ A: 1 }, { A: 3 }]);
		assert.deepEqual(createDiff([{ A: 1 }, { A: 2 }, { A: 3 }], [{ A: 1 }, { A: 2 }, { A: 3 }]), undefined);
		assert.deepEqual(createDiff([1, 2, 3], [1, 2, 3]), undefined);
		assert.deepEqual(createDiff(undefined, [1, 2, 3]), null);
		assert.deepEqual(createDiff([1, 2], [1, 2, 3]), [1, 2]);

		// 嵌套
		assert.deepEqual(createDiff({ A: { B: 1 } }, { A: { B: 1 } }), undefined);
		assert.deepEqual(createDiff({ A: { B: 1, C: 1 } }, { A: { B: 1 } }), { A: { C: 1 } });
		assert.deepEqual(createDiff({ A: { B: 1, C: 1 } }, { A: {} }), { A: { B: 1, C: 1 } });
	});

	test('apply diff', () => {
		// 普通
		assert.deepEqual(applyDiff({ A: 1 }, undefined), { A: 1 });
		assert.deepEqual(applyDiff(undefined, { A: 1 }), { A: 1 });
		assert.deepEqual(applyDiff(undefined, undefined), undefined);
		assert.deepEqual(applyDiff(null, { A: 1 }), undefined);
		assert.deepEqual(applyDiff({ A: null }, { A: 1 }), {});
		assert.deepEqual(applyDiff({ A: 0 }, { A: 1 }), { A: 0 });
		assert.deepEqual(applyDiff({ B: 1 }, { A: 1, B: 1 }), { A: 1, B: 1 });
		assert.deepEqual(applyDiff({ A: false }, { A: 1 }), { A: false });
		assert.deepEqual(applyDiff({ A: false }, { A: [1, 2] }), { A: false });
		assert.deepEqual(applyDiff({ A: false }, { A: { A: 1 } }), { A: false });

		// 嵌套
		assert.deepEqual(applyDiff(undefined, { A: { B: 1 } }), { A: { B: 1 } });
		assert.deepEqual(applyDiff({ A: { C: 1 } }, { A: { B: 1 } }), { A: { B: 1, C: 1 } });
		assert.deepEqual(applyDiff({ A: { B: 1, C: 1 } }, { A: {} }), { A: { B: 1, C: 1 } });

		// 数组
		assert.deepEqual(applyDiff([0], undefined), [0]);
		assert.deepEqual(applyDiff(undefined, [0]), [0]);
		assert.deepEqual(applyDiff(null, [0]), undefined);
		assert.deepEqual(applyDiff([0], [1, 2]), [0]);

		// 模版中没有字段，实体中对应的字段为null
		assert.deepEqual(applyDiff({ B: null }, {}), {});

		// 实体中有多余的object字段，且该object中包含值为null的field
		// 解压之后，多余object中的 null field应该被删除
		assert.deepEqual(applyDiff({ A: { A1: 'ok', A2: null }, B: 1 }, { B: 1 }), { A: { A1: 'ok' }, B: 1 });
	});

	test('apply diff bug', () => {
		const aWithNull = { OnActions: [{}, null] };
		const aWithUndefined = { OnActions: [{}, undefined] };
		const b = { OnActions: [{}, { Name: 'Invoke' }] };

		assert.doesNotThrow(() => {
			applyDiff(aWithNull, b);
		});

		assert.doesNotThrow(() => {
			applyDiff(aWithUndefined, b);
		});
	});
});
