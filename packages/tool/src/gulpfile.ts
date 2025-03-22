import * as gulp from 'gulp';
import { info } from 'gulplog';

import './packages/tool';

gulp.task('test', async () => {
	info('Running tests...');
});

gulp.task('watch:all', async () => {
	info('Watching all files ...');
});
