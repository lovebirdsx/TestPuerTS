import { describe, it, expect } from '../testRunner';
import { compareWidgetProps } from './mockWidgetRoot';

describe('compareWidgetProps', () => {
	it('returns true for identical primitive values', () => {
		expect(compareWidgetProps('hello', 'hello')).toBe(true);
		expect(compareWidgetProps(42, 42)).toBe(true);
		expect(compareWidgetProps(true, true)).toBe(true);
		expect(compareWidgetProps(null, null)).toBe(true);
	});

	it('returns false for different primitive values', () => {
		expect(compareWidgetProps('hello', 'world')).toBe(false);
		expect(compareWidgetProps(1, 2)).toBe(false);
		expect(compareWidgetProps(true, false)).toBe(false);
	});

	it('returns true for same object reference', () => {
		const obj = { Text: 'hello' };
		expect(compareWidgetProps(obj, obj)).toBe(true);
	});

	it('ignores the children key when comparing objects', () => {
		const x = { Text: 'hello', children: [1, 2, 3] };
		const y = { Text: 'hello', children: [4, 5, 6] };
		expect(compareWidgetProps(x, y)).toBe(true);
	});

	it('returns true for deeply equal objects', () => {
		const x = { Color: { R: 1, G: 0, B: 0, A: 1 }, Text: 'hi' };
		const y = { Color: { R: 1, G: 0, B: 0, A: 1 }, Text: 'hi' };
		expect(compareWidgetProps(x, y)).toBe(true);
	});

	it('returns false when a nested value differs', () => {
		const x = { Color: { R: 1, G: 0, B: 0, A: 1 } };
		const y = { Color: { R: 0, G: 0, B: 0, A: 1 } };
		expect(compareWidgetProps(x, y)).toBe(false);
	});

	it('returns false when y has an extra key not present in x', () => {
		const x = { Text: 'hello' };
		const y = { Text: 'hello', Visibility: 1 };
		expect(compareWidgetProps(x, y)).toBe(false);
	});

	it('returns false when x has an extra key not present in y', () => {
		const x = { Text: 'hello', Visibility: 1 };
		const y = { Text: 'hello' };
		expect(compareWidgetProps(x, y)).toBe(false);
	});

	it('returns false when comparing object to non-object', () => {
		expect(compareWidgetProps<unknown>({ Text: 'hello' }, 'hello')).toBe(false);
		expect(compareWidgetProps<unknown>('hello', { Text: 'hello' })).toBe(false);
	});

	it('returns false for undefined vs defined', () => {
		expect(compareWidgetProps<unknown>(undefined, 'value')).toBe(false);
		expect(compareWidgetProps<unknown>('value', undefined)).toBe(false);
	});
});
