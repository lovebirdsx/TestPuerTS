import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

import { exec, formatCheckCircularText, formatTscCheckOutput } from '../common/exec';
import { getConfig } from '../config';
import { formatLintOutput } from '../common/exec';
import { formatMochaTestOutput } from '../common/exec';
import { cleanDirAsync, rmFileAsync } from '../common/util';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'editor');

gulp.task('editor:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await cleanDirAsync(path.join(workingDir, 'out'));
	await rmFileAsync(path.join(workingDir, 'tsconfig.tsbuildinfo'));
});

gulp.task('editor:build', async () => {
	await exec('tsc', { workingDir, logPrefix: '[editor:build] ' });
});

gulp.task('editor:test', async () => {
	await exec('mocha', { workingDir, logPrefix: '[editor:test] ', formatText: formatMochaTestOutput });
});

gulp.task('editor:test:watch', async () => {
	// 此处没有使用mocha --watch，因为@testing-library/react在watch模式下会有问题
	gulp.series('editor:test')(() => {
		gulp.watch([path.join(workingDir, 'src/**/*.ts'), path.join(workingDir, 'src/**/*.tsx')], gulp.task('editor:test')).on('change', (path) => {
			path = path.replace(workingDir, '');
			info(`[editor:test:watch] File ${path} was changed, running tasks...`);
		});
	});
});

gulp.task('editor:watch', async () => {
	await exec('tsc -w', { workingDir, logPrefix: '[editor:watch] ' });
});

gulp.task('editor:tsc-check', async () => {
	await exec('tsc --noEmit', { workingDir, logPrefix: '[editor:tsc-check] ', formatText: formatTscCheckOutput });
	await exec('madge -c --extensions ts,tsx ./src', { workingDir, logPrefix: '[editor:madge] ', formatText: formatCheckCircularText });
});

gulp.task('editor:lint', async () => {
	await exec('eslint src --fix', {
		workingDir,
		noThrow: true,
		logPrefix: '[editor:lint] ',
		formatText: formatLintOutput,
	});
});
