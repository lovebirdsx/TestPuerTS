import * as gulp from 'gulp';
import * as path from 'path';
import { spawn } from 'child_process';
import { info } from 'gulplog';

import { exec, formatLintOutput, formatTscCheckOutput } from '../common/exec';
import { getConfig } from '../config';
import { cleanDirAsync, rmFileAsync } from '../common/util';
import { blue, green, red } from '../common/util';
import { getEditorCmdPath } from './ue';
import { withCache } from '../common/taskCache';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'tests');
const projectRoot = path.resolve(config.packagesPath, '..');
const outDir = path.join(projectRoot, 'Content/JavaScript/tests');

gulp.task('tests:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await rmFileAsync(path.join(workingDir, 'tsconfig.tsbuildinfo'));
	await cleanDirAsync(outDir);
});

gulp.task(
	'tests:build',
	withCache(
		{ taskName: 'tests:build', inputGlobs: ['packages/tests/src/**/*.ts', 'packages/tests/tsconfig.json'] },
		async () => {
			await exec('tsc', {
				workingDir,
				logPrefix: '[tests:build] ',
			});
		},
	),
);

gulp.task(
	'tests:typecheck',
	withCache(
		{ taskName: 'tests:typecheck', inputGlobs: ['packages/tests/src/**/*.ts', 'packages/tests/tsconfig.json'] },
		async () => {
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
			const build = spawn('npx', ['tsc'], { shell: true, cwd: workingDir });

			build.on('close', (code) => {
				if (code === 0) {
					info(`${blue(prefix)}${green('Build succeeded, running ue:test...')}`);
					gulp.task('ue:test')((err: Error | null) => {
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

// ===== RPC 测试任务 =====

const uprojectPath = path.join(projectRoot, 'TestPuerTS.uproject');

/**
 * 运行 PuerTS commandlet 指定测试
 */
function runCommandletTest(testFilter: string, prefix: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const editorCmd = getEditorCmdPath();
		const cmd = `"${editorCmd}" "${uprojectPath}" -run=PuertsTest -test=${testFilter} -unattended -nopause -DisablePlugins=EditorDataStorage`;
		info(`${blue(prefix)}${cmd}`);

		const child = spawn(cmd, { shell: true, cwd: projectRoot });

		child.stdout?.on('data', (data: Buffer) => {
			const text = data.toString().trim();
			if (text) info(`${blue(prefix)}${text}`);
		});

		child.stderr?.on('data', (data: Buffer) => {
			const text = data.toString().trim();
			if (text) info(`${blue(prefix)}${red(text)}`);
		});

		const timeout = setTimeout(() => {
			child.kill();
			reject(new Error('测试超时'));
		}, 60000);

		child.on('close', (code) => {
			clearTimeout(timeout);
			if (code === 0) {
				info(`${blue(prefix)}${green('测试通过！')}`);
				resolve();
			} else {
				reject(new Error(`测试失败，退出码: ${code}`));
			}
		});
	});
}

gulp.task('tests:rpc-server-test', async () => {
	await runCommandletTest('rpcClient', '[tests:rpc-client] ');
});

gulp.task('tests:rpc-client-test', async () => {
	await runCommandletTest('rpcServer', '[tests:rpc-server] ');
});

gulp.task('tests:rpc', gulp.series('tests:build', 'tests:rpc-server-test', 'tests:rpc-client-test'));
