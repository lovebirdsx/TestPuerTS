import * as gulp from 'gulp';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { info } from 'gulplog';

import { exec, formatCheckCircularText, formatLintOutput, formatTscCheckOutput } from '../common/exec';
import { withCache } from '../common/taskCache';
import { getConfig } from '../config';
import { blue, cleanDirAsync, green, red, rmFileAsync } from '../common/util';
import { allSrcGlobs, allTsconfigGlobs, PackageDef, WORKSPACE_PACKAGES } from './registry';
import { sendEditorCommand } from '../common/editorCommand';

const config = getConfig();
const projectRoot = config.projectRoot;
const workspaceTsconfig = 'tsconfig.workspace.json';

// #region workspace 级任务

/**
 * 整个 monorepo 一次 tsc -b。composite project references 自动按拓扑排序，
 * 各包内部用 .tsbuildinfo 做细粒度增量，gulp 缓存只为省一次 spawn。
 */
gulp.task(
	'workspace:build',
	withCache(
		{
			taskName: 'workspace:build',
			inputGlobs: [...allSrcGlobs(), ...allTsconfigGlobs()],
		},
		async () => {
			await exec(`tsc -b ${workspaceTsconfig}`, {
				workingDir: projectRoot,
				logPrefix: '[workspace:build] ',
				formatText: formatTscCheckOutput,
			});
		},
	),
);

/**
 * 一次根级 eslint .。eslint.config.mjs 已配置好整个仓库的 ignore 范围。
 */
gulp.task(
	'workspace:lint',
	withCache(
		{
			taskName: 'workspace:lint',
			inputGlobs: [...allSrcGlobs(), 'eslint.config.mjs'],
		},
		async () => {
			await exec('eslint .', {
				workingDir: projectRoot,
				logPrefix: '[workspace:lint] ',
				formatText: formatLintOutput,
			});
		},
	),
);

gulp.task('workspace:lint:fix', async () => {
	await exec('eslint . --fix', {
		workingDir: projectRoot,
		logPrefix: '[workspace:lint:fix] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});

/**
 * 长驻 tsc -b -w。替代各 per-package 的 watch + tests:tsc:watch。
 * Content/JavaScript/<pkg>/ 等输出位置不变，C++ 端 watch 仍然生效。
 */
gulp.task('workspace:watch', async () => {
	const prefix = '[workspace:watch] ';
	const editorOutDir = path.join(projectRoot, 'Content', 'JavaScript', 'editor');

	return new Promise<void>((_resolve, reject) => {
		const proc = spawn('npx', ['tsc', '-b', '-w', workspaceTsconfig], {
			shell: true,
			cwd: projectRoot,
		});

		proc.stdout?.on('data', (data: Buffer) => {
			const text = data.toString().trimEnd();
			if (text) info(`${blue(prefix)}${text}`);
		});
		proc.stderr?.on('data', (data: Buffer) => {
			const text = data.toString().trimEnd();
			if (text) info(`${blue(prefix)}${red(text)}`);
		});
		proc.on('error', (err) => {
			watcher?.close();
			reject(err);
		});
		proc.on('close', (code) => {
			watcher?.close();
			info(`${blue(prefix)}tsc exited with ${code ?? 'null'}`);
			_resolve();
		});

		// 监听 editor 输出目录，debounce 后发送重启命令
		let debounceTimer: ReturnType<typeof setTimeout> | undefined;
		let watcher: fs.FSWatcher | undefined;
		try {
			watcher = fs.watch(editorOutDir, { recursive: true }, (_event, filename) => {
				// 只对 .js 文件变更触发，过滤 .map / .d.ts / .tsbuildinfo
				if (!filename?.endsWith('.js')) return;
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => {
					info(`${blue(prefix)}editor output changed (${filename}), sending restart...`);
					void sendEditorCommand({ type: 'restart' });
				}, 500);
			});
			watcher.on('error', (err) => {
				info(`${blue(prefix)}${red(`fs.watch error: ${String(err)}`)}`);
			});
		} catch (e) {
			// editorOutDir 首次编译前可能不存在，降级运行（仅 tsc -w，无 auto-restart）
			info(`${blue(prefix)}${red(`Cannot watch ${editorOutDir}: ${String(e)}`)}`);
		}
	});
});

// #endregion

// #region per-package 注册（注册表驱动，新增包零样板）

function registerPackage(pkg: PackageDef): void {
	const lintEntry = pkg.lintEntry ?? 'src';
	const madgeEntry = pkg.madgeEntry ?? './src';

	// per-package lint：保留 per-package 缓存粒度，避免动一处刷整库
	gulp.task(
		`${pkg.name}:lint`,
		withCache(
			{
				taskName: `${pkg.name}:lint`,
				inputGlobs: [...pkg.srcGlob, 'eslint.config.mjs'],
			},
			async () => {
				await exec(`eslint ${lintEntry}`, {
					workingDir: pkg.dir,
					logPrefix: `[${pkg.name}:lint] `,
					formatText: formatLintOutput,
				});
			},
		),
	);

	gulp.task(`${pkg.name}:lint:fix`, async () => {
		await exec(`eslint ${lintEntry} --fix`, {
			workingDir: pkg.dir,
			logPrefix: `[${pkg.name}:lint:fix] `,
			formatText: formatLintOutput,
			noThrow: true,
		});
	});

	// 单包 madge（可选）
	if (pkg.enableMadge) {
		gulp.task(`${pkg.name}:madge`, async () => {
			await exec(`madge -c --extensions ts,tsx ${madgeEntry}`, {
				workingDir: pkg.dir,
				logPrefix: `[${pkg.name}:madge] `,
				formatText: formatCheckCircularText,
			});
		});
	}

	// composite 图无法只构造单包，build/typecheck 全部 alias 到 workspace:build
	// （typecheck 额外加该包的 madge 检查）
	gulp.task(`${pkg.name}:build`, gulp.series('workspace:build'));

	gulp.task(
		`${pkg.name}:typecheck`,
		pkg.enableMadge ? gulp.series('workspace:build', `${pkg.name}:madge`) : gulp.series('workspace:build'),
	);

	// 个别包提供独立 watch（开发时只关注一个包）
	if (pkg.hasWatch) {
		gulp.task(`${pkg.name}:watch`, async () => {
			await exec('tsc -w', {
				workingDir: pkg.dir,
				logPrefix: `[${pkg.name}:watch] `,
				formatText: formatTscCheckOutput,
			});
		});
	}

	// per-package clean：删除 outDir、tsbuildinfo，并失效相关 gulp 缓存条目
	// 否则 <pkg>:clean → workspace:build 时会因输入文件未变命中缓存而 skip 真实编译
	gulp.task(`${pkg.name}:clean`, async () => {
		const absOutDir = path.join(projectRoot, pkg.outDir);
		const tsBuildInfo = path.join(pkg.dir, 'tsconfig.tsbuildinfo');
		const cacheDir = path.join(projectRoot, '.gulp-cache');
		await cleanDirAsync(absOutDir);
		await rmFileAsync(tsBuildInfo);
		// 清理与本包相关的 gulp 缓存条目（输入哈希不变，但产物已删，必须强制下次 cache miss）
		await rmFileAsync(path.join(cacheDir, 'workspace-build.json'));
		await rmFileAsync(path.join(cacheDir, `${pkg.name}-lint.json`));
		info(`${blue(`[${pkg.name}:clean] `)}${green('cleaned')} ${pkg.outDir}`);
	});
}

WORKSPACE_PACKAGES.forEach(registerPackage);

// #endregion

// #region workspace:typecheck（依赖 per-package madge 任务，必须放在注册之后）

const madgeFanout = WORKSPACE_PACKAGES.filter((p) => p.enableMadge).map((p) => `${p.name}:madge`);

gulp.task(
	'workspace:typecheck',
	madgeFanout.length > 0
		? gulp.series('workspace:build', gulp.parallel(...madgeFanout))
		: gulp.series('workspace:build'),
);

// workspace:clean：并行清理所有包产物（互不相交，安全）
gulp.task('workspace:clean', gulp.parallel(...WORKSPACE_PACKAGES.map((p) => `${p.name}:clean`)));

// #endregion
