import * as fs from 'fs';
import * as path from 'path';

// #region 系统相关

export function isWSL(): boolean {
	return process.platform === 'linux' && process.env['WSL_DISTRO_NAME'] !== undefined;
}

export function isWindows(): boolean {
	return process.platform === 'win32';
}

// #region 异步操作

export function timeout(ms: number): Promise<void> {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

// #endregion

// #region 文件操作

export function cleanDir(dir: string): void {
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, { recursive: true });
	}
}

export async function cleanDirAsync(dir: string): Promise<void> {
	if (fs.existsSync(dir)) {
		await fs.promises.rm(dir, { recursive: true });
	}
}

export async function copyFileAsync(src: string, dest: string): Promise<void> {
	if (!fs.existsSync(src)) {
		throw new Error(`File not found: ${src}`);
	}

	const destDir = path.dirname(dest);
	if (!fs.existsSync(destDir)) {
		fs.mkdirSync(destDir, { recursive: true });
	}

	await fs.promises.copyFile(src, dest);
}

export function rmFile(filePath: string): void {
	if (fs.existsSync(filePath)) {
		fs.rmSync(filePath);
	}
}

export async function rmFileAsync(filePath: string): Promise<void> {
	if (fs.existsSync(filePath)) {
		await fs.promises.rm(filePath);
	}
}

export function getFileModifiedTime(filePath: string): number {
	return fs.statSync(filePath).mtimeMs;
}

// #endregion

// #region Json 操作

export function readJsonFile<T>(filePath: string): T | undefined {
	if (!fs.existsSync(filePath)) {
		return undefined;
	}

	return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export function writeJsonFile<T>(filePath: string, data: T): void {
	if (!fs.existsSync(filePath)) {
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
	}

	fs.writeFileSync(filePath, JSON.stringify(data, undefined, 4));
}

// #endregion

// #region 日志输出

/**
 * 转换为绿色的字符串，用于日志输出
 */
export function green(str: string): string {
	return `\x1b[32m${str}\x1b[0m`;
}

/**
 * 转换为黄色的字符串，用于日志输出
 */
export function yellow(str: string): string {
	return `\x1b[33m${str}\x1b[0m`;
}

/**
 * 转换为红色的字符串，用于日志输出
 */
export function red(str: string): string {
	return `\x1b[31m${str}\x1b[0m`;
}

export function isRed(str: string): boolean {
	return str.startsWith('\x1b[31m');
}

/**
 * 转换为蓝色的字符串，用于日志输出
 */
export function blue(str: string): string {
	return `\x1b[34m${str}\x1b[0m`;
}

// #endregion
