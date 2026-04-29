import * as gulp from 'gulp';
import * as path from 'path';
import { getConfig } from '../config';
import { withCache } from '../common/taskCache';
import { exec, formatLintOutput, formatTscCheckOutput } from '../common/exec';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'acp-client');
export const projectRoot = path.resolve(config.packagesPath, '..');
const acpClientDir = path.join(config.packagesPath, 'acp-client');
export const uprojectPath = path.join(projectRoot, 'TestPuerTS.uproject');

gulp.task(
	'acp-client:typecheck',
	withCache(
		{
			taskName: 'acp-client:typecheck',
			inputGlobs: ['packages/acp-client/src/**/*.ts', 'packages/acp-client/tsconfig.json'],
		},
		async () => {
			await exec('tsc --noEmit', {
				workingDir,
				logPrefix: '[acp-client:typecheck] ',
				formatText: formatTscCheckOutput,
			});
		},
	),
);

gulp.task(
	'acp-client:lint',
	withCache(
		{ taskName: 'acp-client:lint', inputGlobs: ['packages/acp-client/src/**/*.ts', 'eslint.config.mjs'] },
		async () => {
			await exec('eslint src', {
				workingDir,
				logPrefix: '[acp-client:lint] ',
				formatText: formatLintOutput,
			});
		},
	),
);

gulp.task('acp-client:lint:fix', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[acp-client:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});

gulp.task(
	'acp-client:build',
	withCache(
		{
			taskName: 'acp-client:build',
			inputGlobs: [
				'packages/acp-client/src/**/*.ts',
				'packages/acp-client/tsconfig.json',
				'packages/acp-client/tsconfig.bridge.json',
			],
		},
		async () => {
			// 编译 PuerTS 端代码
			await exec('tsc', {
				workingDir: acpClientDir,
				logPrefix: '[acp-client:build] ',
			});
			// 编译 Node.js 桥接脚本
			await exec('tsc -p tsconfig.bridge.json', {
				workingDir: acpClientDir,
				logPrefix: '[acp-client:build:bridge] ',
			});
		},
	),
);
