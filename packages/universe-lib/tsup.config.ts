import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		common: 'src/common.ts',
		node: 'src/node.ts',
		platform: 'src/platform.ts',
	},
	format: ['cjs', 'esm'],
	dts: true,
	sourcemap: true,
	clean: true,
	outDir: 'dist',
	platform: 'node',
	target: 'es2022',
	outExtension({ format }) {
		return {
			js: format === 'cjs' ? '.cjs' : '.mjs',
		};
	},
});
