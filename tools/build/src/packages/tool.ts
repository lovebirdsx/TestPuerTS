import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

import { exec, formatVitestOutput } from '../common/exec';
import { getConfig } from '../config';
import { cleanDirAsync } from '../common/util';
import { withCache } from '../common/taskCache';

const config = getConfig();
const workingDir = config.buildToolsPath;

// build/typecheck/lint/lint:fix/watch 已由 workspace.ts 注册表统一处理。
// 本文件仅保留 vitest 测试相关任务（workspace 抽象不覆盖测试）+ clean。

gulp.task('tool:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await cleanDirAsync(path.join(workingDir, 'out'));
});

gulp.task(
	'tool:test',
	withCache({ taskName: 'tool:test', inputGlobs: ['tools/build/src/**/*.ts'] }, async () => {
		await exec('npx vitest run', { workingDir, logPrefix: '[tool:test] ', formatText: formatVitestOutput });
	}),
);

gulp.task('tool:test:watch', async () => {
	gulp.series('tool:test')(() => {
		gulp.watch([path.join(workingDir, 'src/**/*.ts')], gulp.task('tool:test')).on('change', (path) => {
			path = path.replace(workingDir, '');
			info(`[tool:test:watch] File ${path} was changed, running tasks...`);
		});
	});
});
