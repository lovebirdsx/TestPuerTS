import * as gulp from 'gulp';

import './packages/tool';
import './packages/editor';
import './packages/ue';

gulp.task('test', gulp.parallel('tool:test', 'editor:test'));
gulp.task('test:watch', gulp.parallel('tool:test:watch', 'editor:test:watch'));
gulp.task('watch', gulp.parallel('tool:watch', 'editor:watch'));
