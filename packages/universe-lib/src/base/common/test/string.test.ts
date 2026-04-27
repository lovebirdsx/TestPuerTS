import { matchesGlob } from '../strings';
import * as assert from 'assert';
import 'mocha';

suite('matchesGlob', () => {
	test('Simple wildcard "*" matches any string', () => {
		assert.strictEqual(matchesGlob('hello', '*'), true);
		assert.strictEqual(matchesGlob('', '*'), true);
		assert.strictEqual(matchesGlob('anystring', '*'), true);
	});

	test('Wildcard "*" with specific patterns', () => {
		assert.strictEqual(matchesGlob('hello.txt', '*.txt'), true);
		assert.strictEqual(matchesGlob('hello.js', '*.txt'), false);
		assert.strictEqual(matchesGlob('folder/sub/file.txt', 'folder/*/file.txt'), true);
		assert.strictEqual(matchesGlob('folder/sub/deep/file.txt', 'folder/*/file.txt'), false);
	});

	test('Single character wildcard "?"', () => {
		assert.strictEqual(matchesGlob('file1.txt', 'file?.txt'), true);
		assert.strictEqual(matchesGlob('file10.txt', 'file?.txt'), false);
		assert.strictEqual(matchesGlob('filer.txt', 'file?.txt'), true);
	});

	test('Character classes', () => {
		assert.strictEqual(matchesGlob('filea.txt', 'file[abc].txt'), true);
		assert.strictEqual(matchesGlob('filed.txt', 'file[abc].txt'), false);
		assert.strictEqual(matchesGlob('file1.txt', 'file[!abc].txt'), true);
		assert.strictEqual(matchesGlob('filea.txt', 'file[!abc].txt'), false);
	});

	test('Escaping special characters', () => {
		assert.strictEqual(matchesGlob('file?.txt', 'file\\?.txt'), true);
		assert.strictEqual(matchesGlob('file*.txt', 'file\\*.txt'), true);
		assert.strictEqual(matchesGlob('file+.txt', 'file\\+.txt'), true);
		assert.strictEqual(matchesGlob('file+.txt', 'file*.txt'), true);
	});

	test('Multiple wildcards and patterns', () => {
		assert.strictEqual(matchesGlob('src/components/Button.tsx', 'src/*/Button.??x'), true);
		assert.strictEqual(matchesGlob('src/utils/helpers.ts', 'src/*/Button.??x'), false);
		assert.strictEqual(matchesGlob('src/components/Button.jsx', 'src/**/Button.??x'), true); // Note: '**' not handled in matchesGlob
	});

	test('Unmatched brackets are treated as literals', () => {
		assert.strictEqual(matchesGlob('file[abc].txt', 'file[abc.txt'), false); // Treat '[' as literal
		assert.strictEqual(matchesGlob('file].txt', 'file[].txt'), false);
	});

	test('Edge cases', () => {
		assert.strictEqual(matchesGlob('', ''), true);
		assert.strictEqual(matchesGlob('', '*'), true);
		assert.strictEqual(matchesGlob('', '?'), false);
		assert.strictEqual(matchesGlob('a', ''), false);
	});

	test('or patterns', () => {
		assert.strictEqual(matchesGlob('src/index.ts', '**/*.{ts,tsx}'), true);
		assert.strictEqual(matchesGlob('/index.ts', '**/*.{ts,tsx}'), true);
		assert.strictEqual(matchesGlob('src/index.tsx', '**/*.{ts,tsx}'), true);
		assert.strictEqual(matchesGlob('src/index.js', '**/*.{ts,tsx}'), false);
		assert.strictEqual(matchesGlob('src/index.js', '*.{ts,tsx}'), false);
		assert.strictEqual(matchesGlob('index.ts', '*.{ts,tsx}'), true);
		assert.strictEqual(matchesGlob('index.tsx', '*.{ts,tsx}'), true);
	});
});
