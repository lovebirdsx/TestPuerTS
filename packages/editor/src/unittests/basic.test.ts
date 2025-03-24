import * as assert from 'assert';
import { $ref, $unref } from 'puerts';
import * as ue from 'ue';

suite('Basic', () => {
	test('access field', () => {
		const obj = new ue.MainObject();
		assert.strictEqual(obj.MyString, '');
		obj.MyString = 'PPPPP';
		assert.strictEqual(obj.MyString, 'PPPPP');
	});

	test('simple type function', () => {
		const obj = new ue.MainObject();
		assert.strictEqual(obj.Add(100, 300), 400);
	});

	test('complex type function', () => {
		const obj = new ue.MainObject();
		const str = obj.Bar(new ue.Vector(1, 2, 3));
		assert.strictEqual(str, 'UMyObject::Bar(X=1.000 Y=2.000 Z=3.000)');
	});

	test('reference type function', () => {
		const obj = new ue.MainObject();
		const vectorRef = $ref(new ue.Vector(1, 2, 3));
		obj.Bar2(vectorRef);
		const vectorRefValue = $unref(vectorRef);
		assert.strictEqual(vectorRefValue.X, 1024);
	});

	test('static method', () => {
		const str1 = ue.JSBlueprintFunctionLibrary.GetName();
		assert.strictEqual(str1, 'Hello');
	});

	test('extension method', () => {
		const v = new ue.Vector(3, 2, 1);
		assert.strictEqual(v.ToString(), 'X=3.000 Y=2.000 Z=1.000');
		v.Set(8, 88, 888);
		assert.strictEqual(v.ToString(), 'X=8.000 Y=88.000 Z=888.000');
	});
});
