import * as gulp from 'gulp';
import * as fs from 'fs';
import * as path from 'path';
import { info } from 'gulplog';

import { exec, formatCSharpOutput, formatUeOutput } from '../common/exec';
import { getConfig } from '../config';
import { loadDotEnv, readJsonFile, green } from '../common/util';
import { withCache } from '../common/taskCache';
import { quoteForCmd, getTestPassthroughTokens, getAcpPassthroughTokens } from '../common/passthroughArgs';

const config = getConfig();
export const projectRoot = config.projectRoot;
const uprojectPath = path.join(projectRoot, 'TestPuerTS.uproject');
const JSRUNNER_DISABLE_PLUGIN_ARGS = '-DisablePlugins=EditorDataStorage,PythonScriptPlugin,FastBuildController';
const JSRUNNER_DISABLE_PYTHON_ARGS = '-DisablePython';

interface JsRunnerOptions {
	module: string;
	timeout?: number;
	unattended?: boolean;
	watch?: boolean;
	debugPort?: number;
	passthroughArgs?: string[];
}

function buildJsRunnerCmd(editorCmd: string, opts: JsRunnerOptions): string {
	const args: string[] = [`"${uprojectPath}"`, '-run=JsRunner', `-module=${opts.module}`];

	if (opts.timeout !== undefined) args.push(`-timeout=${opts.timeout}`);
	if (opts.debugPort !== undefined) args.push(`-JsEnvDebugPort=${opts.debugPort}`, '-waitDebugger');
	if (opts.watch) args.push('-watch');
	if (opts.unattended !== false) args.push('-unattended');
	args.push('-nopause', '-UTF8Output', JSRUNNER_DISABLE_PLUGIN_ARGS, JSRUNNER_DISABLE_PYTHON_ARGS);

	const base = `"${editorCmd}" ${args.join(' ')}`;
	const tokens = opts.passthroughArgs ?? [];
	return tokens.length > 0 ? `${base} -- ${tokens.map(quoteForCmd).join(' ')}` : base;
}

interface LauncherEntry {
	InstallLocation: string;
	ArtifactId: string;
	AppName: string;
}

interface LauncherInstalled {
	InstallationList: LauncherEntry[];
}

interface UProject {
	EngineAssociation: string;
}

export function getEngineRoot(): string {
	const uproject = readJsonFile<UProject>(uprojectPath);
	if (!uproject) {
		throw new Error(`Cannot read .uproject: ${uprojectPath}`);
	}

	const engineVersion = uproject.EngineAssociation;
	const launcherDatPath = path.join('C:', 'ProgramData', 'Epic', 'UnrealEngineLauncher', 'LauncherInstalled.dat');
	const launcherData = readJsonFile<LauncherInstalled>(launcherDatPath);
	if (!launcherData) {
		throw new Error(`Cannot read launcher data: ${launcherDatPath}`);
	}

	const entry = launcherData.InstallationList.find((e) => e.ArtifactId === `UE_${engineVersion}`);
	if (!entry) {
		throw new Error(`Engine version ${engineVersion} not found in LauncherInstalled.dat`);
	}

	return entry.InstallLocation;
}

function getUnrealBuildToolPath(): string {
	const engineRoot = getEngineRoot();
	const unrealBuildTool = path.join(
		engineRoot,
		'Engine',
		'Binaries',
		'DotNET',
		'UnrealBuildTool',
		'UnrealBuildTool.exe',
	);
	if (!fs.existsSync(unrealBuildTool)) {
		throw new Error(`UnrealBuildTool.exe not found: ${unrealBuildTool}`);
	}

	return unrealBuildTool;
}

function getBuildBatPath(): string {
	const engineRoot = getEngineRoot();
	const buildBat = path.join(engineRoot, 'Engine', 'Build', 'BatchFiles', 'Build.bat');
	if (!fs.existsSync(buildBat)) {
		throw new Error(`Build.bat not found: ${buildBat}`);
	}

	return buildBat;
}

const UE_BUILD_FILES = [
	'Config/**/*.{ini,json}',
	'Plugins/EditorCommon/Source/**/*.{h,cpp,cs,uplugin}',
	'Plugins/EditorHelper/Source/**/*.{h,cpp,cs,uplugin}',
	'Plugins/Puerts/Source/**/*.{h,cpp,cs,uplugin}',
	'Plugins/ReactUMG/Source/**/*.{h,cpp,cs,uplugin}',
	'Source/**/*.{h,cpp,cs,uplugin}',
];

async function buildUe() {
	const buildBat = getBuildBatPath();
	const cmd = `"${buildBat}" TestPuerTSEditor Win64 Development -Project="${uprojectPath}" -WaitMutex -FromMsBuild`;
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		formatText: formatCSharpOutput,
	});
}

gulp.task(
	'ue:build',
	withCache(
		{
			taskName: 'ue:build',
			inputGlobs: UE_BUILD_FILES,
		},
		buildUe,
	),
);

gulp.task('ue:gen_vscode_settings', async () => {
	const unrealBuildTool = getUnrealBuildToolPath();
	const cmd = `"${unrealBuildTool}" -ProjectFiles -VSCode -Project="${uprojectPath}" -Game -Engine`;
	info(`[ue:gen_vscode_settings] ${cmd}`);
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		formatText: formatCSharpOutput,
	});

	// 移除 .ignore 文件，避免对 vscode 和 claude code 的文件搜索造成干扰
	const ignoreFile = path.join(projectRoot, '.ignore');
	if (fs.existsSync(ignoreFile)) {
		fs.unlinkSync(ignoreFile);
	}

	info(green('[ue:gen_vscode_settings] VS Code settings generated successfully'));
});

export function getEditorCmdPath(): string {
	const engineRoot = getEngineRoot();
	const editorCmd = path.join(engineRoot, 'Engine', 'Binaries', 'Win64', 'UnrealEditor-Cmd.exe');
	if (!fs.existsSync(editorCmd)) {
		throw new Error(`UnrealEditor-Cmd.exe not found: ${editorCmd}`);
	}

	return editorCmd;
}

async function genTyping() {
	const editorCmd = getEditorCmdPath();
	const cmd = `"${editorCmd}" "${uprojectPath}" -run=PuertsGenTyping -FULL -unattended -nopause`;
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		formatText: formatUeOutput,
	});
}

gulp.task(
	'ue:gen_typing',
	withCache(
		{
			taskName: 'ue:gen_typing',
			inputGlobs: UE_BUILD_FILES,
		},
		async () => {
			await buildUe();
			await genTyping();
		},
	),
);

gulp.task(
	'ue:test',
	withCache(
		{
			taskName: 'ue:test',
			inputGlobs: ['packages/tests/src/**/*.{ts,tsx}', ...UE_BUILD_FILES],
			bypass: () => getTestPassthroughTokens().length > 0,
		},
		async () => {
			const editorCmd = getEditorCmdPath();
			const cmd = buildJsRunnerCmd(editorCmd, {
				module: 'tests/main',
				timeout: 30,
				passthroughArgs: getTestPassthroughTokens(),
			});
			await exec(cmd, {
				workingDir: projectRoot,
				originalLog: true,
				formatText: (data: string, isError: boolean) => {
					if (data.includes('[ignore]')) {
						return data;
					}
					return formatUeOutput(data, isError);
				},
			});
		},
	),
);

// 调试端口，与 launch.json 中的 "Attach Tests Debugger" 配置保持一致
const TEST_DEBUG_PORT = 9229;

gulp.task('ue:test:debug', async () => {
	const editorCmd = getEditorCmdPath();
	const cmd = buildJsRunnerCmd(editorCmd, {
		module: 'tests/main',
		debugPort: TEST_DEBUG_PORT,
		passthroughArgs: getTestPassthroughTokens(),
	});
	info(`[ue:test:debug] V8 Inspector 监听 ws://127.0.0.1:${TEST_DEBUG_PORT}`);
	info(`[ue:test:debug] 进程已暂停，请在 VS Code 中启动 "Debug Tests" 后继续`);
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		formatText: formatUeOutput,
	});
});

gulp.task(
	'ue:acp-client',
	withCache(
		{
			taskName: 'ue:acp-client',
			inputGlobs: ['packages/acp-client-ue/src/**/*.ts', ...UE_BUILD_FILES],
			bypass: () => getAcpPassthroughTokens().length > 0,
		},
		async () => {
			const editorCmd = getEditorCmdPath();
			// 交互式模式：透传 stdin，去掉 -unattended
			// `-- --protocol --verbose` 是默认调试体验；用户透传参数追加在后面，可覆盖
			const passthrough = getAcpPassthroughTokens();
			const cmd = buildJsRunnerCmd(editorCmd, {
				module: 'acp-client-ue/index',
				timeout: 600,
				unattended: false,
				passthroughArgs: ['--protocol', '--verbose', '--record', ...passthrough],
			});
			// 读取 .env，通过子进程环境变量透传（ueTransport.ts 会将其注入 ACP Server）
			const dotEnv = loadDotEnv(path.join(projectRoot, '.env'));
			await exec(cmd, {
				workingDir: projectRoot,
				originalLog: true,
				passthrough: true,
				interactive: true,
				rawOutput: true,
				env: dotEnv,
				formatText: formatUeOutput,
			});
		},
	),
);

gulp.task('ue:test:watch', async () => {
	const editorCmd = getEditorCmdPath();

	info(`${green('[ue:test:watch] ')}Starting watch mode commandlet`);
	info(`${green('[ue:test:watch] ')}Stop with: touch Content/JavaScript/.watch-stop  (or Ctrl+C)`);

	const cmd = buildJsRunnerCmd(editorCmd, {
		module: 'tests/main',
		timeout: 120,
		unattended: false,
		watch: true,
		passthroughArgs: getTestPassthroughTokens(),
	});
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		passthrough: true,
		interactive: true,
		formatText: formatUeOutput,
	});
});

gulp.task('ue:build:watch', async () => {
	const sourceDir = path.join(projectRoot, 'Source');
	const pluginsDir = path.join(projectRoot, 'Plugins');
	const ignored = ['**/Intermediate/**', '**/Binaries/**'];

	// Header files → build + gen_typing
	const headerGlobs = [path.join(sourceDir, '**/*.h'), path.join(pluginsDir, '**/*.h')];
	gulp.watch(headerGlobs, { ignored }, gulp.series('ue:build', 'ue:gen_typing')).on('change', (filePath: string) => {
		info(
			`[ue:build:watch] Header ${path.relative(projectRoot, filePath)} changed, rebuilding + generating typings...`,
		);
	});

	// Non-header files → build only
	const otherGlobs = [
		path.join(sourceDir, '**/*.cpp'),
		path.join(pluginsDir, '**/*.cpp'),
		path.join(sourceDir, '**/*.cs'),
		path.join(pluginsDir, '**/*.cs'),
		path.join(pluginsDir, '**/*.uplugin'),
		uprojectPath,
	];
	gulp.watch(otherGlobs, { ignored }, gulp.series('ue:build')).on('change', (filePath: string) => {
		info(`[ue:build:watch] File ${path.relative(projectRoot, filePath)} changed, rebuilding...`);
	});
});

gulp.task('ue:build:clean', async () => {
	const buildBat = getBuildBatPath();
	const cmd = `"${buildBat}" TestPuerTSEditor Win64 Development -Project="${uprojectPath}" -WaitMutex -FromMsBuild -Clean`;
	info(`[ue:build:clean] ${cmd}`);
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		formatText: formatCSharpOutput,
	});
	info(green('[ue:build:clean] Clean build completed successfully'));
});
