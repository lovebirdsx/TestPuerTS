import { describe, it, expect } from 'vitest';
import { matchesGlob } from '../strings';

describe('matchesGlob', () => {
	it('Simple wildcard "*" matches any string', () => {
		expect(matchesGlob('hello', '*')).toBe(true);
		expect(matchesGlob('', '*')).toBe(true);
		expect(matchesGlob('anystring', '*')).toBe(true);
	});

	it('Wildcard "*" with specific patterns', () => {
		expect(matchesGlob('hello.txt', '*.txt')).toBe(true);
		expect(matchesGlob('hello.js', '*.txt')).toBe(false);
		expect(matchesGlob('folder/sub/file.txt', 'folder/*/file.txt')).toBe(true);
		expect(matchesGlob('folder/sub/deep/file.txt', 'folder/*/file.txt')).toBe(false);
	});

	it('Single character wildcard "?"', () => {
		expect(matchesGlob('file1.txt', 'file?.txt')).toBe(true);
		expect(matchesGlob('file10.txt', 'file?.txt')).toBe(false);
		expect(matchesGlob('filer.txt', 'file?.txt')).toBe(true);
	});

	it('Character classes', () => {
		expect(matchesGlob('filea.txt', 'file[abc].txt')).toBe(true);
		expect(matchesGlob('filed.txt', 'file[abc].txt')).toBe(false);
		expect(matchesGlob('file1.txt', 'file[!abc].txt')).toBe(true);
		expect(matchesGlob('filea.txt', 'file[!abc].txt')).toBe(false);
	});

	it('Escaping special characters', () => {
		expect(matchesGlob('file?.txt', 'file\\?.txt')).toBe(true);
		expect(matchesGlob('file*.txt', 'file\\*.txt')).toBe(true);
		expect(matchesGlob('file+.txt', 'file\\+.txt')).toBe(true);
		expect(matchesGlob('file+.txt', 'file*.txt')).toBe(true);
	});

	it('Multiple wildcards and patterns', () => {
		expect(matchesGlob('src/components/Button.tsx', 'src/*/Button.??x')).toBe(true);
		expect(matchesGlob('src/utils/helpers.ts', 'src/*/Button.??x')).toBe(false);
		expect(matchesGlob('src/components/Button.jsx', 'src/**/Button.??x')).toBe(true); // Note: '**' not handled in matchesGlob
	});

	it('Unmatched brackets are treated as literals', () => {
		expect(matchesGlob('file[abc].txt', 'file[abc.txt')).toBe(false); // Treat '[' as literal
		expect(matchesGlob('file].txt', 'file[].txt')).toBe(false);
	});

	it('Edge cases', () => {
		expect(matchesGlob('', '')).toBe(true);
		expect(matchesGlob('', '*')).toBe(true);
		expect(matchesGlob('', '?')).toBe(false);
		expect(matchesGlob('a', '')).toBe(false);
	});

	it('or patterns', () => {
		expect(matchesGlob('src/index.ts', '**/*.{ts,tsx}')).toBe(true);
		expect(matchesGlob('/index.ts', '**/*.{ts,tsx}')).toBe(true);
		expect(matchesGlob('src/index.tsx', '**/*.{ts,tsx}')).toBe(true);
		expect(matchesGlob('src/index.js', '**/*.{ts,tsx}')).toBe(false);
		expect(matchesGlob('src/index.js', '*.{ts,tsx}')).toBe(false);
		expect(matchesGlob('index.ts', '*.{ts,tsx}')).toBe(true);
		expect(matchesGlob('index.tsx', '*.{ts,tsx}')).toBe(true);
	});
});
