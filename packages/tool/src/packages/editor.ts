import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

import { exec, formatCheckCircularText, formatTscCheckOutput } from '../common/exec';
import { getConfig } from '../config';
import { formatLintOutput } from '../common/exec';
import { formatVitestOutput } from '../common/exec';
import { cleanDirAsync, rmFileAsync } from '../common/util';
import { withCache } from '../common/taskCache';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'editor');

gulp.task('editor:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await cleanDirAsync(path.join(workingDir, 'out'));
	await rmFileAsync(path.join(workingDir, 'tsconfig.tsbuildinfo'));
});

gulp.task(
	'editor:build',
	withCache(
		{
			taskName: 'editor:build',
			inputGlobs: [
				'packages/editor/src/**/*.{ts,tsx}',
				'packages/editor/tsconfig.json',
				'packages/editor/package.json',
				'packages/acp-client/src/**/*.ts',
				'packages/acp-client/tsconfig.json',
				'packages/acp-client/package.json',
			],
		},
		async () => {
			await exec('tsc -b', { workingDir, logPrefix: '[editor:build] ' });
		},
	),
);

gulp.task(
	'editor:test',
	withCache({ taskName: 'editor:test', inputGlobs: ['packages/editor/src/**/*.{ts,tsx}'] }, async () => {
		await exec('npx vitest run', { workingDir, logPrefix: '[editor:test] ', formatText: formatVitestOutput });
	}),
);

gulp.task('editor:test:watch', async () => {
	// 此处没有使用mocha --watch，因为@testing-library/react在watch模式下会有问题
	gulp.series('editor:test')(() => {
		gulp.watch(
			[path.join(workingDir, 'src/**/*.ts'), path.join(workingDir, 'src/**/*.tsx')],
			gulp.task('editor:test'),
		).on('change', (path) => {
			path = path.replace(workingDir, '');
			info(`[editor:test:watch] File ${path} was changed, running tasks...`);
		});
	});
});

gulp.task('editor:watch', async () => {
	await exec('tsc -w', { workingDir, logPrefix: '[editor:watch] ', formatText: formatTscCheckOutput });
});

gulp.task(
	'editor:typecheck',
	withCache(
		{
			taskName: 'editor:typecheck',
			inputGlobs: [
				'packages/editor/src/**/*.{ts,tsx}',
				'packages/editor/tsconfig.json',
				'packages/editor/package.json',
				'packages/acp-client/src/**/*.ts',
				'packages/acp-client/tsconfig.json',
				'packages/acp-client/package.json',
			],
		},
		async () => {
			await exec('tsc --noEmit', {
				workingDir,
				logPrefix: '[editor:typecheck] ',
				formatText: formatTscCheckOutput,
			});
			await exec('madge -c --extensions ts,tsx ./src', {
				workingDir,
				logPrefix: '[editor:madge] ',
				formatText: formatCheckCircularText,
			});
		},
	),
);

gulp.task(
	'editor:lint',
	withCache(
		{ taskName: 'editor:lint', inputGlobs: ['packages/editor/src/**/*.{ts,tsx}', 'eslint.config.mjs'] },
		async () => {
			await exec('eslint src', {
				workingDir,
				logPrefix: '[editor:lint] ',
				formatText: formatLintOutput,
			});
		},
	),
);

gulp.task('editor:lint:fix', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[editor:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});
