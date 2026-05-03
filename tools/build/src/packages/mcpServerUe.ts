import * as gulp from 'gulp';
import * as path from 'path';
import { getConfig } from '../config';
import { withCache } from '../common/taskCache';
import { exec, formatLintOutput, formatTscCheckOutput } from '../common/exec';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'mcp-server-ue');

gulp.task(
	'mcp-server-ue:typecheck',
	withCache(
		{
			taskName: 'mcp-server-ue:typecheck',
			inputGlobs: [
				'packages/editor-common/src/**/*.ts',
				'packages/editor-common/tsconfig.json',
				'packages/editor-common/package.json',
				'packages/mcp-server-ue/src/**/*.ts',
				'packages/mcp-server-ue/tsconfig.json',
				'packages/mcp-server-ue/package.json',
			],
		},
		async () => {
			await exec('tsc --noEmit', {
				workingDir,
				logPrefix: '[mcp-server-ue:typecheck] ',
				formatText: formatTscCheckOutput,
			});
		},
	),
);

gulp.task(
	'mcp-server-ue:lint',
	withCache(
		{ taskName: 'mcp-server-ue:lint', inputGlobs: ['packages/mcp-server-ue/src/**/*.ts', 'eslint.config.mjs'] },
		async () => {
			await exec('eslint src', {
				workingDir,
				logPrefix: '[mcp-server-ue:lint] ',
				formatText: formatLintOutput,
			});
		},
	),
);

gulp.task('mcp-server-ue:lint:fix', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[mcp-server-ue:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});

gulp.task(
	'mcp-server-ue:build',
	withCache(
		{
			taskName: 'mcp-server-ue:build',
			inputGlobs: [
				'packages/editor-common/src/**/*.ts',
				'packages/editor-common/tsconfig.json',
				'packages/editor-common/package.json',
				'packages/mcp-server-ue/src/**/*.ts',
				'packages/mcp-server-ue/tsconfig.json',
				'packages/mcp-server-ue/package.json',
			],
		},
		async () => {
			await exec('tsc', {
				workingDir,
				logPrefix: '[mcp-server-ue:build] ',
			});
		},
	),
);
