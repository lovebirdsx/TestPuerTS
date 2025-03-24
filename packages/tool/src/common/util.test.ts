import * as assert from 'assert';
import { getFileModifiedTime } from './util';

suite('Util', () => {
	test('get modify time', () => {
		console.log('get modify time test...');
		assert.ok(getFileModifiedTime(__filename) > 0);
	});
});
