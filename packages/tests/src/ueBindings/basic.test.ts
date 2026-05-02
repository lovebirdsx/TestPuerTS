import { $ref, $unref } from 'puerts';
import * as ue from 'ue';
import { describe, it, expect } from '../testRunner';

describe('UeBindings > Basic', () => {
	it('access field', () => {
		const obj = new ue.MainObject();
		expect(obj.MyString).toBe('');
		obj.MyString = 'PPPPP';
		expect(obj.MyString).toBe('PPPPP');
	});

	it('simple type function', () => {
		const obj = new ue.MainObject();
		expect(obj.Add(100, 300)).toBe(400);
	});

	it('complex type function', () => {
		const obj = new ue.MainObject();
		const str = obj.Bar(new ue.Vector(1, 2, 3));
		expect(str).toBe('UMyObject::Bar(X=1.000 Y=2.000 Z=3.000)');
	});

	it('reference type function', () => {
		const obj = new ue.MainObject();
		const vectorRef = $ref(new ue.Vector(1, 2, 3));
		obj.Bar2(vectorRef);
		const vectorRefValue = $unref(vectorRef);
		expect(vectorRefValue.X).toBe(1024);
	});

	it('static method', () => {
		const str1 = ue.JSBlueprintFunctionLibrary.GetName();
		expect(str1).toBe('Hello');
	});

	it('extension method', () => {
		const v = new ue.Vector(3, 2, 1);
		expect(v.ToString()).toBe('X=3.000 Y=2.000 Z=1.000');
		v.Set(8, 88, 888);
		expect(v.ToString()).toBe('X=8.000 Y=88.000 Z=888.000');
	});

	it('default params', () => {
		const obj = new ue.MainObject();
		expect(obj.DefaultTest()).toBe('Str: i am default, I: 10, Vec: X=1.100 Y=2.200 Z=3.300');
		expect(obj.DefaultTest('custom')).toBe('Str: custom, I: 10, Vec: X=1.100 Y=2.200 Z=3.300');
		expect(obj.DefaultTest('custom', 20)).toBe('Str: custom, I: 20, Vec: X=1.100 Y=2.200 Z=3.300');
		expect(obj.DefaultTest('custom', 20, new ue.Vector(4, 5, 6))).toBe(
			'Str: custom, I: 20, Vec: X=4.000 Y=5.000 Z=6.000',
		);
	});

	it('enum', () => {
		expect(ue.EToTest.V0).toBe(0);
		expect(ue.EToTest.V1).toBe(1);
		expect(ue.EToTest.V13).toBe(13);
	});
});
