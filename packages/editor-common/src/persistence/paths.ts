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

function getProjectName(): string {
	const dir = trimTrailingSlash(normalizeSlashes(getUE().JsRunHelper.GetProjectDir()));
	const idx = dir.lastIndexOf('/');
	return idx >= 0 ? dir.slice(idx + 1) : dir;
}

export function setPersistenceRoot(root: string | undefined): void {
	overrideRoot = root === undefined ? undefined : trimTrailingSlash(normalizeSlashes(root));
}

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
