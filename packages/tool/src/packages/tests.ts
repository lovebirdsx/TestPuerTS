import * as gulp from 'gulp';
import * as path from 'path';
import { spawn, type ChildProcess } from 'child_process';
import { info } from 'gulplog';

import { exec, formatEsbuildOutput, formatLintOutput, formatTscCheckOutput } from '../common/exec';
import { getConfig } from '../config';
import { cleanDirAsync, rmFileAsync } from '../common/util';
import { blue, green, red } from '../common/util';
import { getEditorCmdPath } from './ue';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'tests');
const projectRoot = path.resolve(config.packagesPath, '..');
const outDir = path.join(projectRoot, 'Content/JavaScript/tests');

gulp.task('tests:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await rmFileAsync(path.join(workingDir, 'tsconfig.tsbuildinfo'));
	await cleanDirAsync(outDir);
});

gulp.task('tests:build', async () => {
	await exec('npx tsx esbuild.config.ts', {
		workingDir,
		logPrefix: '[tests:build] ',
		formatText: formatEsbuildOutput,
	});
});

gulp.task('tests:typecheck', async () => {
	await exec('tsc --noEmit', { workingDir, logPrefix: '[tests:typecheck] ', formatText: formatTscCheckOutput });
});

gulp.task('tests:lint', async () => {
	await exec('eslint src', {
		workingDir,
		logPrefix: '[tests:lint] ',
		formatText: formatLintOutput,
	});
});

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
			const build = spawn('npx', ['tsx', 'esbuild.config.ts'], { shell: true, cwd: workingDir });

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

// ===== RPC 跨进程测试任务 =====

const uprojectPath = path.join(projectRoot, 'TestPuerTS.uproject');

/**
 * 等待子进程 stdout 中出现指定文本
 */
function waitForOutput(child: ChildProcess, signal: string, timeoutMs = 15000): Promise<void> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error(`等待输出 "${signal}" 超时`));
		}, timeoutMs);

		child.stdout?.on('data', (data: Buffer) => {
			const text = data.toString();
			if (text.includes(signal)) {
				clearTimeout(timeout);
				resolve();
			}
		});

		child.on('close', (code) => {
			clearTimeout(timeout);
			if (code !== 0) {
				reject(new Error(`进程退出码: ${code}`));
			}
		});
	});
}

/**
 * 等待子进程退出
 */
function waitForExit(child: ChildProcess, timeoutMs = 30000): Promise<number> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			child.kill();
			reject(new Error('进程退出超时'));
		}, timeoutMs);

		child.on('close', (code) => {
			clearTimeout(timeout);
			resolve(code ?? 1);
		});
	});
}

/**
 * 运行 PuerTS commandlet 指定模块
 */
function spawnCommandlet(moduleName: string, prefix: string): ChildProcess {
	const editorCmd = getEditorCmdPath();
	const cmd = `"${editorCmd}" "${uprojectPath}" -run=PuertsTest -module=${moduleName} -unattended -nopause -DisablePlugins=EditorDataStorage`;
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

	return child;
}

/**
 * 运行 Node.js 独立脚本
 */
function spawnNodeScript(scriptName: string, prefix: string): ChildProcess {
	const scriptPath = path.join(outDir, 'standalone', scriptName);
	info(`${blue(prefix)}node ${scriptPath}`);
	const child = spawn('node', [scriptPath], { shell: true, cwd: projectRoot });

	child.stdout?.on('data', (data: Buffer) => {
		const text = data.toString().trim();
		if (text) info(`${blue(prefix)}${text}`);
	});

	child.stderr?.on('data', (data: Buffer) => {
		const text = data.toString().trim();
		if (text) info(`${blue(prefix)}${red(text)}`);
	});

	return child;
}

/**
 * 测试用例 1：Node.js 运行 RPC Server，PuerTS 运行 RPC Client
 */
gulp.task('tests:rpc-server-test', async () => {
	const prefix = '[tests:rpc-server-test] ';
	info(`${blue(prefix)}${green('启动 Node.js RPC Server...')}`);

	// 1. 启动 Node.js server
	const nodeServer = spawnNodeScript('nodeServer.js', '[nodeServer] ');

	try {
		// 2. 等待 server 就绪
		await waitForOutput(nodeServer, 'SERVER_READY');
		info(`${blue(prefix)}${green('Node.js Server 就绪，启动 PuerTS Client...')}`);

		// 3. 启动 PuerTS commandlet 作为 client
		const commandlet = spawnCommandlet('tests/rpcClientMain', '[puertsClient] ');

		// 4. 等待 commandlet 完成
		const exitCode = await waitForExit(commandlet);

		if (exitCode !== 0) {
			throw new Error(`PuerTS Client 退出码: ${exitCode}`);
		}

		info(`${blue(prefix)}${green('测试通过！')}`);
	} finally {
		// 确保 Node.js 进程被关闭
		nodeServer.kill();
	}
});

/**
 * 测试用例 2：PuerTS 运行 RPC Server，Node.js 运行 RPC Client
 */
gulp.task('tests:rpc-client-test', async () => {
	const prefix = '[tests:rpc-client-test] ';
	info(`${blue(prefix)}${green('启动 PuerTS RPC Server...')}`);

	// 1. 启动 PuerTS commandlet 作为 server
	const commandlet = spawnCommandlet('tests/rpcServerMain', '[puertsServer] ');

	try {
		// 2. 等待 server 就绪
		await waitForOutput(commandlet, 'SERVER_READY');
		info(`${blue(prefix)}${green('PuerTS Server 就绪，启动 Node.js Client...')}`);

		// 3. 启动 Node.js client
		const nodeClient = spawnNodeScript('nodeClient.js', '[nodeClient] ');

		// 4. 等待 Node.js client 完成
		const clientExitCode = await waitForExit(nodeClient);
		if (clientExitCode !== 0) {
			throw new Error(`Node.js Client 退出码: ${clientExitCode}`);
		}

		// 5. 等待 commandlet 完成
		const serverExitCode = await waitForExit(commandlet);
		if (serverExitCode !== 0) {
			throw new Error(`PuerTS Server 退出码: ${serverExitCode}`);
		}

		info(`${blue(prefix)}${green('测试通过！')}`);
	} finally {
		commandlet.kill();
	}
});

/**
 * 运行所有 RPC 测试
 */
gulp.task('tests:rpc', gulp.series('tests:build', 'tests:rpc-server-test', 'tests:rpc-client-test'));
