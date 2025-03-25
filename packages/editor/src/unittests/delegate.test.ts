import * as assert from 'assert';
import { $ref, $set, $unref } from 'puerts';
import * as ue from 'ue';

suite('Delegate', () => {
	test('muticast', () => {
		const obj = new ue.MainObject();
		let result1: number = 0;
		let result2: number = 0;

		obj.NotifyWithInt.Add((i) => {
			result1 = i;
		});

		obj.NotifyWithInt.Add((i) => {
			result2 = i;
		});

		obj.NotifyWithInt.Broadcast(100);
		assert.strictEqual(result1, 100);
		assert.strictEqual(result2, 100);
	});

	test('delegate', () => {
		const obj = new ue.MainObject();
		let result: string = '';

		assert.strictEqual(obj.NotifyWithString.IsBound(), false);
		obj.NotifyWithString.Bind((value) => {
			result = value;
		});

		obj.NotifyWithString.Execute('hello');
		assert.strictEqual(result, 'hello');
		assert.strictEqual(obj.NotifyWithString.IsBound(), true);
	});

	test('ref', () => {
		const obj = new ue.MainObject();
		obj.NotifyWithRefString.Bind((strRef) => {
			const outerStr = $unref(strRef);
			$set(strRef, outerStr + '-out');
		});

		const strRef = $ref('hello');
		obj.NotifyWithRefString.Execute(strRef);
		assert.strictEqual($unref(strRef), 'hello-out');
	});

	test('return value', () => {
		const obj = new ue.MainObject();
		obj.NotifyWithStringRet.Bind((str) => {
			return str + '-result';
		});

		const result = obj.NotifyWithStringRet.Execute('test');
		assert.strictEqual(result, 'test-result');
	});
});
