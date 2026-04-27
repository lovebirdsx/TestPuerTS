import { beforeEach } from 'vitest';
import * as assert from 'assert';

suite('Performance', () => {
	beforeEach(() => {
		performance.clearMarks();
	});

	test('simple', () => {
		performance.mark('start');
		performance.mark('end');

		const marks = performance.getEntriesByType('mark');
		assert.strictEqual(marks.length, 2);
		assert.strictEqual(marks[0].name, 'start');
		assert.strictEqual(marks[1].name, 'end');
	});

	test('nodejs perf', () => {
		performance.mark('start');
		performance.mark('end');

		const marks = performance.getEntries();
		assert.strictEqual(marks.length, 2);
	});
});
