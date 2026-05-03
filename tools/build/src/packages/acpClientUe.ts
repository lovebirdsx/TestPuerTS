import * as gulp from 'gulp';
import * as path from 'path';
import { getConfig } from '../config';
import { withCache } from '../common/taskCache';
import { exec, formatLintOutput, formatTscCheckOutput } from '../common/exec';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'acp-client-ue');
export const projectRoot = config.projectRoot;
const acpClientDir = path.join(config.packagesPath, 'acp-client-ue');
export const uprojectPath = path.join(projectRoot, 'TestPuerTS.uproject');

gulp.task(
	'acp-client-ue:typecheck',
	withCache(
		{
			taskName: 'acp-client-ue:typecheck',
			inputGlobs: [
				'packages/acp-client-ue/src/**/*.ts',
				'packages/acp-client-ue/tsconfig.json',
				'packages/acp-client-ue/package.json',
			],
		},
		async () => {
			await exec('tsc --noEmit', {
				workingDir,
				logPrefix: '[acp-client-ue:typecheck] ',
				formatText: formatTscCheckOutput,
			});
		},
	),
);

gulp.task(
	'acp-client-ue:lint',
	withCache(
		{ taskName: 'acp-client-ue:lint', inputGlobs: ['packages/acp-client-ue/src/**/*.ts', 'eslint.config.mjs'] },
		async () => {
			await exec('eslint src', {
				workingDir,
				logPrefix: '[acp-client-ue:lint] ',
				formatText: formatLintOutput,
			});
		},
	),
);

gulp.task('acp-client-ue:lint:fix', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[acp-client-ue:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});

gulp.task(
	'acp-client-ue:build',
	withCache(
		{
			taskName: 'acp-client-ue:build',
			inputGlobs: [
				'packages/acp-client-ue/src/**/*.ts',
				'packages/acp-client-ue/tsconfig.json',
				'packages/acp-client-ue/package.json',
			],
		},
		async () => {
			await exec('tsc', {
				workingDir: acpClientDir,
				logPrefix: '[acp-client-ue:build] ',
			});
		},
	),
);
