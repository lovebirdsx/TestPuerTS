import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

// 注册表驱动的 workspace 任务（含按包薄包装：<pkg>:lint / build / typecheck / watch / lint:fix / madge / clean）
import './packages/workspace';

// UE 专属任务（C++ 构建、commandlet）
import './packages/ue';

import { getConfig } from './config';
import { cleanDirAsync, green } from './common/util';

// #region 顶层组合任务（不再硬编码包名，新增包不需修改本文件）

gulp.task('build', gulp.series('ue:gen_typing', 'workspace:build'));
gulp.task('typecheck', gulp.series('workspace:typecheck'));
gulp.task('lint', gulp.series('workspace:lint'));
gulp.task('lint:fix', gulp.series('workspace:lint:fix'));

gulp.task('test', gulp.series('ue:test'));
gulp.task('check', gulp.series('build', 'typecheck', 'lint', 'test'));

// 开发任务
gulp.task('test:watch', gulp.parallel('workspace:watch', 'ue:test:watch'));
gulp.task('watch', gulp.parallel('workspace:watch', 'ue:build:watch'));
gulp.task('dev', gulp.series('ue:build', 'watch'));

// 缓存管理
gulp.task('cache:clear', async () => {
	const projectRoot = getConfig().projectRoot;
	await cleanDirAsync(path.join(projectRoot, '.gulp-cache'));
	info(green('[cache:clear] Cache cleared'));
});

// 全量清理：业务包产物 + gulp 缓存（并行）→ UE C++ 构建产物（串行，耗时长）
gulp.task('clean', gulp.series(gulp.parallel('workspace:clean', 'cache:clear'), 'ue:build:clean'));

// #endregion
