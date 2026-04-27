import { Emitter } from '../event';
import * as assert from 'assert';

suite('Event', () => {
	test('should fire event - empty', () => {
		const emitter = new Emitter<string>();
		let callCount = 0;
		emitter.event(() => callCount++);
		emitter.fire('test');
		assert.strictEqual(callCount, 1);
		emitter.dispose();
	});

	test('should fire event - with data', () => {
		const emitter = new Emitter<string>();
		let data = '';
		emitter.event((e) => (data = e));
		emitter.fire('test');
		assert.strictEqual(data, 'test');
		emitter.dispose();
	});
});
