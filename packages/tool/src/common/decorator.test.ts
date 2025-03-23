import * as assert from 'assert';
import { memoize } from './decorator';

suite('Decorator', () => {
	test('run once', () => {
		class MyClass {
			callCount = 0;

			@memoize
			foo() {
				this.callCount++;
				return 'foo';
			}
		}

		const myClass = new MyClass();

		assert.strictEqual(myClass.foo(), 'foo');
		assert.strictEqual(myClass.callCount, 1);
		assert.strictEqual(myClass.foo(), 'foo');
		assert.strictEqual(myClass.callCount, 1);
	});
});
