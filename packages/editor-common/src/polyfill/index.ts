import { installAbortControllerPolyfill } from './abortController';
import { installPuertsTimerPolyfill } from './timer';
import { installTextCodecPolyfill } from './utf8';

export { encodeUtf8, decodeUtf8, Utf8StreamDecoder } from './utf8';

/**
 * 每个 PuerTS 入口（editor main / tests main / acp-client CLI 等）必须在
 * 最早期调用一次 `installPuertsTimerPolyfill()`，再 import 其他依赖。
 */
export function installPuertsPolyfill(): void {
	installPuertsTimerPolyfill();
	installTextCodecPolyfill();
	installAbortControllerPolyfill();
}
