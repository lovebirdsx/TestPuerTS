import * as esbuild from 'esbuild';
import * as module from 'module';

const nodeBuiltins = module.builtinModules.flatMap((m) => [m, `node:${m}`]);

// PuerTS 入口：bundle @universe/lib，external ue/puerts/node builtins
export const puertsConfig: esbuild.BuildOptions = {
	entryPoints: ['src/main.ts', 'src/rpcClientMain.ts', 'src/rpcServerMain.ts'],
	bundle: true,
	platform: 'node',
	target: 'es2022',
	format: 'cjs',
	outdir: '../../Content/JavaScript/tests',
	external: ['ue', 'puerts', ...nodeBuiltins],
	sourcemap: true,
	logLevel: 'info',
};

// Node.js 独立脚本入口：bundle @universe/lib，external node builtins
export const standaloneConfig: esbuild.BuildOptions = {
	entryPoints: ['src/standalone/nodeServer.ts', 'src/standalone/nodeClient.ts'],
	bundle: true,
	platform: 'node',
	target: 'es2022',
	format: 'cjs',
	outdir: '../../Content/JavaScript/tests/standalone',
	external: [...nodeBuiltins],
	sourcemap: true,
	logLevel: 'info',
};

async function build() {
	await Promise.all([esbuild.build(puertsConfig), esbuild.build(standaloneConfig)]);
}

build().catch((err) => {
	console.error(err);
	process.exit(1);
});
