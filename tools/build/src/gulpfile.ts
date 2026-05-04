import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

// 注册表驱动的 workspace 任务（含按包薄包装：<pkg>:lint / build / typecheck / watch / lint:fix / madge）
import './packages/workspace';

// UE 专属任务（C++ 构建、commandlet）
import './packages/ue';

// 不被 workspace 抽象覆盖的特殊任务：
//   - tool: vitest 单元测试（tool:test / tool:test:watch / tool:clean）
//   - tests: 仓库 commandlet watch（ue:test:watch）+ tests:clean
import './packages/tool';
import './packages/tests';

import { getConfig } from './config';
import { cleanDirAsync, green } from './common/util';

// #region 顶层组合任务（不再硬编码包名，新增包不需修改本文件）

gulp.task('build', gulp.series('ue:gen_typing', 'workspace:build'));
gulp.task('typecheck', gulp.series('workspace:typecheck'));
gulp.task('lint', gulp.series('workspace:lint'));
gulp.task('lint:fix', gulp.series('workspace:lint:fix'));

gulp.task('test', gulp.parallel('tool:test', 'ue:test'));
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

// #endregion
