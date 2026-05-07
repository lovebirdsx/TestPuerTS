/**
 * PuerTS 运行时 polyfill：补齐第三方 Node 代码（universe-lib / MCP SDK / ACP SDK 等）
 * 习惯省略的 delay 参数，并在 V8 模式下补齐 TextEncoder/TextDecoder。
 *
 * PuerTS 底层 setTimeout/setInterval C++ 绑定要求 delay 必须是 int32；
 * `setTimeout(fn)` 等省略调用会抛 "Bad parameters #1, expect a int32"，
 * 或被 PuerTS 内置 `puerts/promises.js` 包了一层后转给 C++ 时取到 undefined，
 * 导致定时器永不触发——表现为 MCP `Protocol.connect()` 等链路推不动，
 * 直至命中 SDK 默认 60s 请求超时。
 */
let installed = false;

export function installPuertsTimerPolyfill(): void {
	if (installed) return;
	installed = true;

	const origSetTimeout = globalThis.setTimeout;
	const origSetInterval = globalThis.setInterval;

	(globalThis as unknown as { setTimeout: typeof setTimeout }).setTimeout = function (
		handler: (...args: unknown[]) => void,
		timeout?: number,
		...args: unknown[]
	) {
		return origSetTimeout(handler, timeout ?? 0, ...args);
	} as typeof setTimeout;

	(globalThis as unknown as { setInterval: typeof setInterval }).setInterval = function (
		handler: (...args: unknown[]) => void,
		timeout?: number,
		...args: unknown[]
	) {
		return origSetInterval(handler, timeout ?? 0, ...args);
	} as typeof setInterval;
}
