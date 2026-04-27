import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
	{
		ignores: ['out/**', 'dist/**', 'tsconfig.tsbuildinfo'],
	},
	{
		files: ['**/*.{ts,tsx,js,mjs}'],
		extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
		rules: {
			'@typescript-eslint/no-unsafe-declaration-merging': 'off',
			'no-constant-condition': 'off',
			'no-prototype-builtins': 'off',
			'no-constant-binary-expression': 'off',
			'@typescript-eslint/no-this-alias': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-duplicate-enum-values': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/array-type': 'error',
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/ban-types': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-wrapper-object-types': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},
	eslintPluginPrettierRecommended,
	{
		files: ['**/*.test.ts'],
		rules: {
			'@typescript-eslint/no-unused-expressions': 'off',
		},
	},
);
