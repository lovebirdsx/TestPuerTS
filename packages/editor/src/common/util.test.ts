import * as assert from 'assert';
import { getFileModifiedTime } from './util';

suite('Util', () => {
	test('get modify time', () => {
		assert.ok(getFileModifiedTime(__filename) > 0);
	});
});
