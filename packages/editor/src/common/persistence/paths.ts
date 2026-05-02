// 仅引入类型，避免 vitest 等非 PuerTS 环境模块加载时触发 'ue' 解析失败
import type * as UEType from 'ue';

let overrideRoot: string | undefined;
let cachedUE: typeof UEType | undefined;

function getUE(): typeof UEType {
	if (!cachedUE) {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		cachedUE = require('ue') as typeof UEType;
	}
	return cachedUE;
}

function normalizeSlashes(p: string): string {
	return p.replace(/\\/g, '/');
}

function trimTrailingSlash(p: string): string {
	return p.endsWith('/') ? p.slice(0, -1) : p;
}

// 从项目目录路径提取项目名（取最后一个非空目录段）
function getProjectName(): string {
	const dir = trimTrailingSlash(normalizeSlashes(getUE().JsRunHelper.GetProjectDir()));
	const idx = dir.lastIndexOf('/');
	return idx >= 0 ? dir.slice(idx + 1) : dir;
}

// 显式覆盖持久化根目录（主要用于测试）
export function setPersistenceRoot(root: string | undefined): void {
	overrideRoot = root === undefined ? undefined : trimTrailingSlash(normalizeSlashes(root));
}

// 解析持久化根目录：
// 1. setPersistenceRoot 显式覆盖
// 2. %APPDATA%/<ProjectName>/EditorPersistence
// 3. 兜底：<ProjectSavedDir>/EditorPersistence
export function getPersistenceRoot(): string {
	if (overrideRoot !== undefined) {
		return overrideRoot;
	}

	const ue = getUE();
	const appData = ue.ProcessIOHelper.GetEnvVar('APPDATA');
	if (appData) {
		const base = trimTrailingSlash(normalizeSlashes(appData));
		return `${base}/${getProjectName()}/EditorPersistence`;
	}

	const saved = trimTrailingSlash(normalizeSlashes(ue.KismetSystemLibrary.GetProjectSavedDirectory()));
	return `${saved}/EditorPersistence`;
}

export function getStoreFilePath(name: string): string {
	return `${getPersistenceRoot()}/${name}.json`;
}

export function getCorruptBackupPath(name: string, timestamp: number): string {
	return `${getPersistenceRoot()}/${name}.corrupt-${timestamp}.json`;
}
