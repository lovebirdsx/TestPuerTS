import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

import { exec, formatCheckCircularText, formatTscCheckOutput } from '../common/exec';
import { getConfig } from '../config';
import { formatLintOutput } from '../common/exec';
import { formatMochaTestOutput } from '../common/exec';
import { cleanDirAsync } from '../common/util';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'tool');

gulp.task('tool:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await cleanDirAsync(path.join(workingDir, 'out'));
});

gulp.task('tool:build', async () => {
	await exec('tsc', { workingDir, logPrefix: '[tool:build] ' });
});

gulp.task('tool:test', async () => {
	await exec('mocha', { workingDir, logPrefix: '[tool:test] ', formatText: formatMochaTestOutput });
});

gulp.task('tool:test:watch', async () => {
	gulp.series('tool:test')(() => {
		gulp.watch([path.join(workingDir, 'src/**/*.ts')], gulp.task('tool:test')).on('change', (path) => {
			path = path.replace(workingDir, '');
			info(`[tool:test:watch] File ${path} was changed, running tasks...`);
		});
	});
});

gulp.task('tool:watch', async () => {
	await exec('tsc -w', { workingDir, logPrefix: '[tool:watch] ' });
});

gulp.task('tool:tsc-check', async () => {
	await exec('tsc --noEmit', { workingDir, logPrefix: '[tool:tsc-check] ', formatText: formatTscCheckOutput });
	await exec('madge -c --extensions ts,tsx ./src', { workingDir, logPrefix: '[tool:madge] ', formatText: formatCheckCircularText });
});

gulp.task('tool:lint', async () => {
	await exec('eslint src --fix', {
		workingDir,
		logPrefix: '[tool:lint] ',
		formatText: formatLintOutput,
		noThrow: true,
	});
});
