/**
 * tests 入口的 PuerTS polyfill：调用 editor-common 共享实现。
 * 见 `@universe-agent/editor-common` 的 `installPuertsTimerPolyfill`。
 */

import { installConsoleOverride, installPuertsTimerPolyfill } from '@universe-agent/editor-common';

installPuertsTimerPolyfill();

// 把 globalThis.console 重定向到 UJsLogHelper，让所有 JS（含第三方库）输出
// 都走 UE_LOG（受 GLog 锁保护），消除字节级交错。
installConsoleOverride('test');
