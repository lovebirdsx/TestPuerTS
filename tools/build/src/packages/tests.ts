import * as gulp from 'gulp';
import * as path from 'path';
import { spawn } from 'child_process';
import { info } from 'gulplog';

import { getConfig } from '../config';
import { cleanDirAsync, rmFileAsync } from '../common/util';
import { blue, red } from '../common/util';
import { getEditorCmdPath } from './ue';

const config = getConfig();
const workingDir = path.join(config.packagesPath, 'tests');
const projectRoot = config.projectRoot;
const outDir = path.join(projectRoot, 'Content/JavaScript/tests');

gulp.task('tests:clean', async () => {
	await cleanDirAsync(path.join(workingDir, 'node_modules'));
	await rmFileAsync(path.join(workingDir, 'tsconfig.tsbuildinfo'));
	await cleanDirAsync(outDir);
});

// 长驻 commandlet：JsEnv 内 -watch 模式，检测 Content/JavaScript 变化自动重启 JsEnv 重跑测试。
// build/typecheck/lint/lint:fix/watch 已由 workspace.ts 注册表统一处理。
// TS 编译侧用 `npx gulp workspace:watch`（根级 tsc -b -w）替代旧的 tests:tsc:watch。
gulp.task('ue:test:watch', async () => {
	const editorCmd = getEditorCmdPath();
	const uprojectPath = path.join(projectRoot, 'TestPuerTS.uproject');
	const args = [
		`"${uprojectPath}"`,
		'-run=JsRunner',
		'-module=tests/main',
		'-watch',
		'-timeout=120',
		'-nopause',
		'-UTF8Output',
		'-DisablePlugins=EditorDataStorage',
	];

	info(`${blue('[ue:test:watch] ')}Starting watch mode commandlet`);
	info(`${blue('[ue:test:watch] ')}Stop with: touch Content/JavaScript/.watch-stop  (or Ctrl+C)`);

	await new Promise<void>((resolve, reject) => {
		const proc = spawn(`"${editorCmd}"`, args, {
			shell: true,
			cwd: projectRoot,
			stdio: ['inherit', 'pipe', 'pipe'],
			env: { ...process.env },
		});

		proc.stdout?.on('data', (data: Buffer) => {
			process.stdout.write(data);
		});
		proc.stderr?.on('data', (data: Buffer) => {
			process.stderr.write(red(data.toString()));
		});

		proc.on('close', (code) => {
			if (code !== 0 && code !== null) {
				reject(new Error(`ue:test:watch exited with code ${code}`));
			} else {
				resolve();
			}
		});
	});
});
