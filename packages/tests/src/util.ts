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
