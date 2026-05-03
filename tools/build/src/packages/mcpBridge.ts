import * as gulp from 'gulp';
import * as path from 'path';
import { getConfig } from '../config';
import { withCache } from '../common/taskCache';
import { exec, formatLintOutput, formatTscCheckOutput } from '../common/exec';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'mcp-bridge');

gulp.task(
	'mcp-bridge:typecheck',
	withCache(
		{
			taskName: 'mcp-bridge:typecheck',
			inputGlobs: [
				'packages/mcp-bridge/src/**/*.ts',
				'packages/mcp-bridge/tsconfig.json',
				'packages/mcp-bridge/package.json',
			],
		},
		async () => {
			await exec('tsc --noEmit', {
				workingDir,
				logPrefix: '[mcp-bridge:typecheck] ',
				formatText: formatTscCheckOutput,
			});
		},
	),
);

gulp.task(
	'mcp-bridge:lint',
	withCache(
		{ taskName: 'mcp-bridge:lint', inputGlobs: ['packages/mcp-bridge/src/**/*.ts', 'eslint.config.mjs'] },
		async () => {
			await exec('eslint src', {
				workingDir,
				logPrefix: '[mcp-bridge:lint] ',
				formatText: formatLintOutput,
			});
		},
	),
);

gulp.task('mcp-bridge:lint:fix', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[mcp-bridge:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});

gulp.task(
	'mcp-bridge:build',
	withCache(
		{
			taskName: 'mcp-bridge:build',
			inputGlobs: [
				'packages/mcp-bridge/src/**/*.ts',
				'packages/mcp-bridge/tsconfig.json',
				'packages/mcp-bridge/package.json',
			],
		},
		async () => {
			await exec('tsc', {
				workingDir,
				logPrefix: '[mcp-bridge:build] ',
			});
		},
	),
);
