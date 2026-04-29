import * as gulp from 'gulp';
import * as fs from 'fs';
import * as path from 'path';
import { info } from 'gulplog';

import { exec, formatCSharpOutput } from '../common/exec';
import { getConfig } from '../config';
import { readJsonFile } from '../common/util';
import { green } from '../common/util';
import { withCache } from '../common/taskCache';

const config = getConfig();
const projectRoot = path.resolve(config.packagesPath, '..');
const uprojectPath = path.join(projectRoot, 'TestPuerTS.uproject');

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

gulp.task('ue:build', async () => {
	const buildBat = getBuildBatPath();
	const cmd = `"${buildBat}" TestPuerTSEditor Win64 Development -Project="${uprojectPath}" -WaitMutex -FromMsBuild`;
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		formatText: formatCSharpOutput,
	});
});

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

gulp.task('ue:gen_typing', async () => {
	const editorCmd = getEditorCmdPath();
	const cmd = `"${editorCmd}" "${uprojectPath}" -run=PuertsGenTyping -FULL -unattended -nopause`;
	info(`[ue:gen_typing] ${cmd}`);
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
	});
	info(green('[ue:gen_typing] Typing generation completed'));
});

gulp.task(
	'ue:test',
	withCache(
		{
			taskName: 'ue:test',
			inputGlobs: [
				'packages/tests/src/**/*.{ts,tsx}',
				'Plugins/EditorCommon/Source/**/*.{h,cpp,cs,uplugin}',
				'Plugins/EditorHelper/Source/**/*.{h,cpp,cs,uplugin}',
				'Plugins/Puerts/Source/**/*.{h,cpp,cs,uplugin}',
				'/Source/TestPuerTS/**/*.{h,cpp,cs,uplugin}',
			],
		},
		async () => {
			const editorCmd = getEditorCmdPath();
			const cmd = `"${editorCmd}" "${uprojectPath}" -run=PuertsTest -unattended -nopause -DisablePlugins=EditorDataStorage`;
			await exec(cmd, {
				workingDir: projectRoot,
				originalLog: true,
			});
		},
	),
);

gulp.task(
	'ue:acp-client',
	withCache(
		{
			taskName: 'ue:acp-client',
			inputGlobs: [
				'packages/acp-client/src/**/*.ts',
				'Plugins/EditorCommon/Source/**/*.{h,cpp,cs,uplugin}',
				'Plugins/EditorHelper/Source/**/*.{h,cpp,cs,uplugin}',
				'Plugins/Puerts/Source/**/*.{h,cpp,cs,uplugin}',
				'/Source/TestPuerTS/**/*.{h,cpp,cs,uplugin}',
			],
		},
		async () => {
			const editorCmd = getEditorCmdPath();
			const cmd = `"${editorCmd}" "${uprojectPath}" -run=ACPClient -timeout=600 -unattended -nopause -DisablePlugins=EditorDataStorage`;
			await exec(cmd, {
				workingDir: projectRoot,
				originalLog: true,
			});
		},
	),
);

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

	info(green('[ue:build:watch] Watching C++ sources for changes...'));
});

gulp.task('ue:build:clean', async () => {
	const buildBat = getBuildBatPath();
	const cmd = `"${buildBat}" TestPuerTSEditor Win64 Development -Project="${uprojectPath}" -WaitMutex -FromMsBuild -Clean`;
	info(`[ue:build:clean] ${cmd}`);
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
	});
	info(green('[ue:build:clean] Clean build completed successfully'));
});
