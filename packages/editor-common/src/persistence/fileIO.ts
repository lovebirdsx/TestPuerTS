import type * as UEType from 'ue';

export interface IFileIO {
	readText(filePath: string): Promise<string | undefined>;
	writeText(filePath: string, content: string): Promise<void>;
	fileExists(filePath: string): Promise<boolean>;
	makeDirTree(path: string): Promise<void>;
}

let cachedUE: typeof UEType | undefined;
function getUE(): typeof UEType {
	if (!cachedUE) {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		cachedUE = require('ue') as typeof UEType;
	}
	return cachedUE;
}

function waitResult(result: UEType.AsyncFileResult): Promise<UEType.AsyncFileResult> {
	return new Promise((resolve) => {
		result.OnComplete.Add(() => resolve(result));
	});
}

export const ueFileIO: IFileIO = {
	async readText(filePath: string): Promise<string | undefined> {
		const ue = getUE();
		const exists = await waitResult(ue.ProcessIOHelper.FileExists(filePath));
		if (!exists.bSuccess) {
			return undefined;
		}
		const r = await waitResult(ue.ProcessIOHelper.ReadTextFile(filePath));
		return r.Content;
	},

	async writeText(filePath: string, content: string): Promise<void> {
		const ue = getUE();
		const r = await waitResult(ue.ProcessIOHelper.WriteTextFile(filePath, content));
		if (!r.bSuccess) {
			throw new Error(`WriteTextFile failed: ${filePath}`);
		}
	},

	async fileExists(filePath: string): Promise<boolean> {
		const ue = getUE();
		const r = await waitResult(ue.ProcessIOHelper.FileExists(filePath));
		return r.bSuccess;
	},

	async makeDirTree(path: string): Promise<void> {
		const ue = getUE();
		const r = await waitResult(ue.ProcessIOHelper.MakeDirTree(path));
		if (!r.bSuccess) {
			throw new Error(`MakeDirTree failed: ${path}`);
		}
	},
};
