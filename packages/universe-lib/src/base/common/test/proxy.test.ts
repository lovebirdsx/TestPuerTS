import * as assert from 'assert';

suite('Proxy', () => {
	test('observe prop modification', () => {
		let setCallCount = 0;

		const data = {};
		const handler = {
			set(target: Record<string, any>, prop: string, value: any) {
				setCallCount++;
				target[prop] = value;
				return true;
			},
		};
		const proxy = new Proxy(data, handler);
		proxy.foo = 'bar';
		assert.strictEqual(proxy.foo, 'bar');
		assert.strictEqual(setCallCount, 1);
	});
});
