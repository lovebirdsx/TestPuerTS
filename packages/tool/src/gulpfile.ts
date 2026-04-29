import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

import './packages/tool';
import './packages/editor';
import './packages/ue';
import './packages/tests';
import './packages/acpClient';

import { getConfig } from './config';
import { cleanDirAsync, green } from './common/util';

// 统一组合任务
gulp.task('build', gulp.parallel('tool:build', 'editor:build', 'tests:build', 'acp-client:build', 'ue:build'));
gulp.task('typecheck', gulp.parallel('tool:typecheck', 'editor:typecheck', 'tests:typecheck', 'acp-client:typecheck'));
gulp.task('lint', gulp.parallel('tool:lint', 'editor:lint', 'tests:lint', 'acp-client:lint'));
gulp.task('lint:fix', gulp.parallel('tool:lint:fix', 'editor:lint:fix', 'tests:lint:fix', 'acp-client:lint:fix'));
gulp.task('unittest', gulp.parallel('tool:test', 'editor:test', 'ue:test'));
gulp.task('check', gulp.series('build', 'typecheck', 'lint', 'unittest'));

// 兼容任务
gulp.task('test', gulp.parallel('tool:test', 'editor:test', 'ue:test'));
gulp.task('test:watch', gulp.parallel('tool:test:watch', 'editor:test:watch'));

// 开发任务
gulp.task('watch', gulp.parallel('editor:watch', 'tests:watch', 'ue:build:watch'));
gulp.task('dev', gulp.series('ue:build', 'watch'));

// 缓存管理
gulp.task('cache:clear', async () => {
	const projectRoot = path.resolve(getConfig().packagesPath, '..');
	await cleanDirAsync(path.join(projectRoot, '.gulp-cache'));
	info(green('[cache:clear] Cache cleared'));
});
