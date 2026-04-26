import * as gulp from 'gulp';
import * as fs from 'fs';
import * as path from 'path';
import { info } from 'gulplog';

import { exec, formatCSharpOutput } from '../common/exec';
import { getConfig } from '../config';
import { readJsonFile } from '../common/util';
import { green } from '../common/util';

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

function getEngineRoot(): string {
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
	info(`[ue:build] ${cmd}`);
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
		formatText: formatCSharpOutput,
	});
	info(green('[ue:build] Build completed successfully'));
});

function getEditorCmdPath(): string {
	const engineRoot = getEngineRoot();
	const editorCmd = path.join(engineRoot, 'Engine', 'Binaries', 'Win64', 'UnrealEditor-Cmd.exe');
	if (!fs.existsSync(editorCmd)) {
		throw new Error(`UnrealEditor-Cmd.exe not found: ${editorCmd}`);
	}

	return editorCmd;
}

gulp.task('ue:test', async () => {
	const editorCmd = getEditorCmdPath();
	const cmd = `"${editorCmd}" "${uprojectPath}" -run=PuertsTest -unattended -nopause -DisablePlugins=EditorDataStorage`;
	info(`[ue:test] ${cmd}`);
	await exec(cmd, {
		workingDir: projectRoot,
		originalLog: true,
	});
	info(green('[ue:test] Tests completed'));
});

gulp.task('ue:build:watch', async () => {
	const sourceDir = path.join(projectRoot, 'Source');
	const pluginsDir = path.join(projectRoot, 'Plugins');
	const watchGlobs = [
		// C++ source files
		path.join(sourceDir, '**/*.h'),
		path.join(sourceDir, '**/*.cpp'),
		path.join(pluginsDir, '**/*.h'),
		path.join(pluginsDir, '**/*.cpp'),
		// Build configuration files
		path.join(sourceDir, '**/*.cs'),
		path.join(pluginsDir, '**/*.cs'),
		path.join(pluginsDir, '**/*.uplugin'),
		uprojectPath,
	];
	const ignored = [
		'**/Intermediate/**',
		'**/Binaries/**',
	];

	info(green('[ue:build:watch] Watching C++ sources for changes...'));
	gulp.watch(watchGlobs, { ignored }, gulp.series('ue:build', 'ue:test')).on('change', (filePath: string) => {
		const relative = path.relative(projectRoot, filePath);
		info(`[ue:build:watch] File ${relative} was changed, rebuilding...`);
	});
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
