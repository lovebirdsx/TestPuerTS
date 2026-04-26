import * as gulp from 'gulp';
import * as path from 'path';
import { spawn } from 'child_process';
import { info } from 'gulplog';

import { exec, formatTscCheckOutput } from '../common/exec';
import { getConfig } from '../config';
import { cleanDirAsync, rmFileAsync } from '../common/util';
import { blue, green, red } from '../common/util';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'tests');

gulp.task('tests:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await rmFileAsync(path.join(workingDir, 'tsconfig.tsbuildinfo'));
});

gulp.task('tests:build', async () => {
	await exec('tsc', { workingDir, logPrefix: '[tests:build] ' });
});

gulp.task('tests:watch', async () => {
	const prefix = '[tests:watch] ';

	return new Promise<void>((_resolve, reject) => {
		const tsc = spawn('tsc', ['-w'], { shell: true, cwd: workingDir });

		tsc.on('close', (code) => {
			if (code !== 0) {
				reject(new Error(`tsc -w exited with code ${code}`));
			}
		});

		tsc.stdout?.on('data', (data: Buffer) => {
			const text = data.toString();
			if (text.trim()) {
				const formatted = formatTscCheckOutput(text, false);
				info(`${blue(prefix)}${formatted}`);
			}

			if (text.includes('Watching for file changes')) {
				if (text.includes('Found 0 errors')) {
					info(`${blue(prefix)}${green('Compilation succeeded, running ue:test...')}`);
					gulp.task('ue:test')((err: Error | null) => {
						if (err) {
							info(`${blue(prefix)}${red(`ue:test failed: ${err.message}`)}`);
						}
					});
				} else {
					info(`${blue(prefix)}${red('Compilation has errors, skipping ue:test')}`);
				}
			}
		});

		tsc.stderr?.on('data', (data: Buffer) => {
			const text = data.toString();
			if (text.trim()) {
				info(`${blue(prefix)}${red(text)}`);
			}
		});
	});
});
