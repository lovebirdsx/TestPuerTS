import { installAbortControllerPolyfill } from './abortController';
import { installCjsReexportShims } from './cjsReexport';
import { installProcessPolyfill } from './process';
import { installPuertsTimerPolyfill } from './timer';
import { installTextCodecPolyfill } from './utf8';

export { encodeUtf8, decodeUtf8, Utf8StreamDecoder } from './utf8';

/**
 * 每个 PuerTS 入口（editor main / tests main / acp-client CLI 等）必须在
 * 最早期调用一次 `installPuertsPolyfill()`，再 import 其他依赖。
 *
 * 顺序约束：
 * 1. process polyfill 先行：immer / react 的 dev 入口顶层会读取 process.env.NODE_ENV。
 * 2. cjs 重导出 shim 紧随其后：必须在任何 `require('react')` / `require('immer')` 之前
 *    把真实模块固化为 builtin，否则消费者捕获的是空对象。
 * 3. 其余 polyfill（timer / TextEncoder / AbortController）顺序无关。
 */
export function installPuertsPolyfill(): void {
	installProcessPolyfill();
	installCjsReexportShims();
	installPuertsTimerPolyfill();
	installTextCodecPolyfill();
	installAbortControllerPolyfill();
}
