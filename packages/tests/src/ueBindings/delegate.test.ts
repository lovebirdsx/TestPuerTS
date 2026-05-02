import { $ref, $set, $unref } from 'puerts';
import * as ue from 'ue';
import { describe, it, expect } from '../testRunner';

describe('UeBindings > Delegate', () => {
	it('muticast', () => {
		const obj = new ue.MainObject();
		let result1 = 0;
		let result2 = 0;

		obj.NotifyWithInt.Add((i) => {
			result1 = i;
		});

		obj.NotifyWithInt.Add((i) => {
			result2 = i;
		});

		obj.NotifyWithInt.Broadcast(100);
		expect(result1).toBe(100);
		expect(result2).toBe(100);
	});

	it('delegate', () => {
		const obj = new ue.MainObject();
		let result = '';

		expect(obj.NotifyWithString.IsBound()).toBe(false);
		obj.NotifyWithString.Bind((value) => {
			result = value;
		});

		obj.NotifyWithString.Execute('hello');
		expect(result).toBe('hello');
		expect(obj.NotifyWithString.IsBound()).toBe(true);
	});

	it('ref', () => {
		const obj = new ue.MainObject();
		obj.NotifyWithRefString.Bind((strRef) => {
			const outerStr = $unref(strRef);
			$set(strRef, outerStr + '-out');
		});

		const strRef = $ref('hello');
		obj.NotifyWithRefString.Execute(strRef);
		expect($unref(strRef)).toBe('hello-out');
	});

	it('return value', () => {
		const obj = new ue.MainObject();
		obj.NotifyWithStringRet.Bind((str) => {
			return str + '-result';
		});

		const result = obj.NotifyWithStringRet.Execute('test');
		expect(result).toBe('test-result');
	});
});
