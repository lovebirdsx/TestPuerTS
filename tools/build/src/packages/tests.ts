import * as gulp from 'gulp';
import * as path from 'path';
import { spawn } from 'child_process';
import { info } from 'gulplog';

import { exec, formatLintOutput, formatTscCheckOutput } from '../common/exec';
import { getConfig } from '../config';
import { cleanDirAsync, rmFileAsync } from '../common/util';
import { blue, green, red } from '../common/util';
import { withCache } from '../common/taskCache';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'tests');
const projectRoot = config.projectRoot;
const outDir = path.join(projectRoot, 'Content/JavaScript/tests');

gulp.task('tests:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await rmFileAsync(path.join(workingDir, 'tsconfig.tsbuildinfo'));
	await cleanDirAsync(outDir);
});

gulp.task(
	'tests:build',
	withCache(
		{
			taskName: 'tests:build',
			inputGlobs: [
				'packages/editor-common/src/**/*.ts',
				'packages/editor-common/tsconfig.json',
				'packages/editor/src/**/*.{ts,tsx}',
				'packages/editor/tsconfig.json',
				'packages/tests/src/**/*.ts',
				'packages/tests/tsconfig.json',
			],
		},
		async () => {
			await exec('tsc -b', {
				workingDir,
				logPrefix: '[tests:build] ',
			});
		},
	),
);

gulp.task(
	'tests:typecheck',
	withCache(
		{
			taskName: 'tests:typecheck',
			inputGlobs: [
				'packages/editor-common/src/**/*.ts',
				'packages/editor-common/tsconfig.json',
				'packages/editor/src/**/*.{ts,tsx}',
				'packages/editor/tsconfig.json',
				'packages/tests/src/**/*.ts',
				'packages/tests/tsconfig.json',
			],
		},
		async () => {
			const editorCommonDir = path.join(config.packagesPath, 'editor-common');
			await exec('tsc -b', { workingDir: editorCommonDir, logPrefix: '[tests:typecheck/editor-common] ' });
			// editor must be built first so its .d.ts files exist for tests to reference
			const editorDir = path.join(config.packagesPath, 'editor');
			await exec('tsc -b', { workingDir: editorDir, logPrefix: '[tests:typecheck/editor] ' });
			await exec('tsc --noEmit', {
				workingDir,
				logPrefix: '[tests:typecheck] ',
				formatText: formatTscCheckOutput,
			});
		},
	),
);

gulp.task(
	'tests:lint',
	withCache({ taskName: 'tests:lint', inputGlobs: ['packages/tests/src/**/*.ts', 'eslint.config.mjs'] }, async () => {
		await exec('eslint src', {
			workingDir,
			logPrefix: '[tests:lint] ',
			formatText: formatLintOutput,
		});
	}),
);

gulp.task('tests:lint:fix', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[tests:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});

gulp.task('tests:watch', async () => {
	const prefix = '[tests:watch] ';

	return new Promise<void>((_resolve, reject) => {
		// 先执行一次构建
		const buildOnChange = () => {
			info(`${blue(prefix)}${green('Building...')}`);
			const build = spawn('npx', ['tsc', '-b'], { shell: true, cwd: workingDir });

			build.on('close', (code) => {
				if (code === 0) {
					info(`${blue(prefix)}${green('Build succeeded, running ue:test...')}`);
					gulp.task('ue:test')!((err: Error | null | undefined) => {
						if (err) {
							info(`${blue(prefix)}${red(`ue:test failed: ${err.message}`)}`);
						}
					});
				} else {
					info(`${blue(prefix)}${red('Build failed, skipping ue:test')}`);
				}
			});

			build.stdout?.on('data', (data: Buffer) => {
				const text = data.toString().trim();
				if (text) info(`${blue(prefix)}${text}`);
			});

			build.stderr?.on('data', (data: Buffer) => {
				const text = data.toString().trim();
				if (text) info(`${blue(prefix)}${red(text)}`);
			});
		};

		// 初次构建
		buildOnChange();

		// 监听源文件变化
		const watcher = gulp.watch(['src/**/*.ts'], { cwd: workingDir, ignoreInitial: true });
		watcher.on('change', buildOnChange);
		watcher.on('add', buildOnChange);
		watcher.on('unlink', buildOnChange);

		watcher.on('error', (err) => {
			reject(err);
		});
	});
});
