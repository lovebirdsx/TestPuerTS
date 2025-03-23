import * as fs from 'fs';

export function getFileModifiedTime(filePath: string): number {
	return fs.statSync(filePath).mtimeMs;
}
