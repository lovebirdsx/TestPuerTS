/**
 * PuerTS 的 setTimeout/setInterval 底层实现要求 delay 参数为 int32，
 * 但 universe-lib 等 Node.js 代码习惯省略 delay 参数（即 setTimeout(fn)）。
 * 此 polyfill 确保 delay 缺失时默认为 0。
 */

import { installConsoleOverride } from '@universe-agent/editor-common';

const _origSetTimeout = globalThis.setTimeout;
const _origSetInterval = globalThis.setInterval;

(globalThis as any).setTimeout = function (handler: (...args: any[]) => void, timeout?: number, ...args: any[]) {
	return _origSetTimeout(handler, timeout ?? 0, ...args);
};

(globalThis as any).setInterval = function (handler: (...args: any[]) => void, timeout?: number, ...args: any[]) {
	return _origSetInterval(handler, timeout ?? 0, ...args);
};

// 把 globalThis.console 重定向到 UJsLogHelper，让所有 JS（含第三方库）输出
// 都走 UE_LOG（受 GLog 锁保护），消除字节级交错。
installConsoleOverride('test');
