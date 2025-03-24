import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

// 配置参考：https://eslint.org/docs/latest/use/configure/configuration-files
export default tseslint.config(
	{
		ignores: [
			'**/node_modules/**', //
			'**/dist/**',
			'**/out/**',
			'**/.vscode-test/**',
			'**/Library/**',
			'**/Temp/**',
			'**/Resources/**',
			'**/index.d.ts',
			'**/Typing/**',
			'**/Content/JavaScript/**',
		],
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
);
