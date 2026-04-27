import { describe, it, beforeEach, expect } from 'vitest';

describe('Performance', () => {
	beforeEach(() => {
		performance.clearMarks();
	});

	it('simple', () => {
		performance.mark('start');
		performance.mark('end');

		const marks = performance.getEntriesByType('mark');
		expect(marks.length).toBe(2);
		expect(marks[0].name).toBe('start');
		expect(marks[1].name).toBe('end');
	});

	it('nodejs perf', () => {
		performance.mark('start');
		performance.mark('end');

		const marks = performance.getEntries();
		expect(marks.length).toBe(2);
	});
});
