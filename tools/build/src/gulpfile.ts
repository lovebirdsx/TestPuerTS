import * as gulp from 'gulp';
import * as path from 'path';
import { info } from 'gulplog';

import './packages/tool';
import './packages/editorCommon';
import './packages/editor';
import './packages/ue';
import './packages/tests';
import './packages/acpClientUe';
import './packages/mcpBridge';
import './packages/mcpServerUe';

import { getConfig } from './config';
import { cleanDirAsync, green } from './common/util';

// 统一组合任务
gulp.task(
	'build',
	gulp.series(
		'ue:gen_typing',
		// mcp-server-ue 通过 import '@universe-agent/mcp-bridge/dist/shared' 依赖
		// mcp-bridge 的构建产物，必须先编译 mcp-bridge。
		'mcp-bridge:build',
		'editor-common:build',
		gulp.parallel('tool:build', 'editor:build', 'tests:build', 'acp-client-ue:build', 'mcp-server-ue:build'),
	),
);
gulp.task(
	'typecheck',
	gulp.series(
		// typecheck 也需要 mcp-bridge 的 dist/shared.d.ts 存在
		'mcp-bridge:build',
		'editor-common:build',
		gulp.parallel(
			'tool:typecheck',
			'editor-common:typecheck',
			'editor:typecheck',
			'tests:typecheck',
			'acp-client-ue:typecheck',
			'mcp-bridge:typecheck',
			'mcp-server-ue:typecheck',
		),
	),
);
gulp.task(
	'lint',
	gulp.parallel(
		'tool:lint',
		'editor-common:lint',
		'editor:lint',
		'tests:lint',
		'acp-client-ue:lint',
		'mcp-bridge:lint',
		'mcp-server-ue:lint',
	),
);
gulp.task(
	'lint:fix',
	gulp.parallel(
		'tool:lint:fix',
		'editor-common:lint:fix',
		'editor:lint:fix',
		'tests:lint:fix',
		'acp-client-ue:lint:fix',
		'mcp-bridge:lint:fix',
		'mcp-server-ue:lint:fix',
	),
);

gulp.task('test', gulp.parallel('tool:test', 'ue:test'));
gulp.task('check', gulp.series('build', 'typecheck', 'lint', 'test'));

// 开发任务
gulp.task('test:watch', gulp.parallel('tests:tsc:watch', 'ue:test:watch'));
gulp.task('watch', gulp.parallel('editor:watch', 'tests:watch', 'ue:build:watch'));
gulp.task('dev', gulp.series('ue:build', 'watch'));

// 缓存管理
gulp.task('cache:clear', async () => {
	const projectRoot = getConfig().projectRoot;
	await cleanDirAsync(path.join(projectRoot, '.gulp-cache'));
	info(green('[cache:clear] Cache cleared'));
});
