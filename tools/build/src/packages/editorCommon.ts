import * as gulp from 'gulp';
import * as path from 'path';

import { getConfig } from '../config';
import { withCache } from '../common/taskCache';
import { exec, formatLintOutput, formatTscCheckOutput } from '../common/exec';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'editor-common');

gulp.task(
	'editor-common:build',
	withCache(
		{
			taskName: 'editor-common:build',
			inputGlobs: [
				'packages/editor-common/src/**/*.ts',
				'packages/editor-common/tsconfig.json',
				'packages/editor-common/package.json',
			],
		},
		async () => {
			await exec('tsc -b', {
				workingDir,
				logPrefix: '[editor-common:build] ',
			});
		},
	),
);

gulp.task(
	'editor-common:typecheck',
	withCache(
		{
			taskName: 'editor-common:typecheck',
			inputGlobs: [
				'packages/editor-common/src/**/*.ts',
				'packages/editor-common/tsconfig.json',
				'packages/editor-common/package.json',
			],
		},
		async () => {
			await exec('tsc --noEmit', {
				workingDir,
				logPrefix: '[editor-common:typecheck] ',
				formatText: formatTscCheckOutput,
			});
		},
	),
);

gulp.task(
	'editor-common:lint',
	withCache(
		{
			taskName: 'editor-common:lint',
			inputGlobs: ['packages/editor-common/src/**/*.ts', 'eslint.config.mjs'],
		},
		async () => {
			await exec('eslint src', {
				workingDir,
				logPrefix: '[editor-common:lint] ',
				formatText: formatLintOutput,
			});
		},
	),
);

gulp.task('editor-common:lint:fix', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[editor-common:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});
