## CLAUDE.md

editor-common 是 editor、mcp-server-ue、tests 共享的 Unreal 关联基础模块包。

**构建输出：** `Content/JavaScript/editor-common/`（composite，生成 .d.ts 供其他包引用）

**职责边界：**

- 提供与 UE/PuerTS 运行时相关但不包含 UI 的公共实现。
- 当前包含五类能力：
  - 日志层：`createLogger`、`installConsoleOverride`
  - PuerTS 运行时 polyfill：`installPuertsPolyfill`（一站式注入 `process` / cjs 重导出 shim / timer / TextEncoder/Decoder / AbortController）
  - UTF-8 编解码：`encodeUtf8` / `decodeUtf8` / `Utf8StreamDecoder`（PuerTS V8 模式下没有原生 `TextEncoder`/`TextDecoder`）
  - IPC 基础层：`BridgeLink`、`UeIpcSocket`
  - 持久化层：`defineStore`、`PersistenceStore`、`flushAllPersistence`、`ueFileIO`
- 不承载 editor UI、MCP tool 业务逻辑、测试专用断言工具。

**关键文件：**

- `src/index.ts`: 包级导出入口
- `src/logging/index.ts`: `createLogger(category)` / `installConsoleOverride(rootCategory)`：包装 `UE.JsLogHelper` 让 JS 输出统一走 `UE_LOG(LogJs)`
- `src/polyfill/timer.ts`: `installPuertsTimerPolyfill()`：补齐 `setTimeout`/`setInterval` 缺省 delay
- `src/polyfill/utf8.ts`: `encodeUtf8` / `decodeUtf8` / `Utf8StreamDecoder`，以及 `installTextCodecPolyfill()`（V8 模式下注入全局 `TextEncoder`/`TextDecoder`，最小可用实现）
- `src/polyfill/abortController.ts`: `installAbortControllerPolyfill()`：V8 模式下注入全局 `AbortController` / `AbortSignal`（覆盖 MCP SDK 等用到的子集）
- `src/polyfill/process.ts`: `installProcessPolyfill()`：保证 `globalThis.process.env` 存在（immer / react 等 dev 入口顶层会读 `process.env.NODE_ENV`）。
- `src/polyfill/cjsReexport.ts`: `installCjsReexportShims()`：把 `react` / `immer` 的 dev 实现预先 require 后通过 `puerts.registerBuildinModule(name, ...)` 固化为 builtin。绕开 PuerTS `modular.js` 对 `module.exports = require('./xxx')` 重导出形式不友好的问题——这种入口下，消费者顶层 `var X = require(name)` 捕获到的是空对象，导致 `React.useCallback is not a function` / `immer.produce is not a function`。
- `src/ipc/bridgeLink.ts`: bridge 双向链路接口定义
- `src/ipc/ueIpcSocket.ts`: `UE.IPCTransport` 到 `ISocket` 的适配
- `src/persistence/store.ts`: zod 驱动的类型化持久化 store 实现
- `src/persistence/fileIO.ts`: `UE.ProcessIOHelper` Promise 化封装
- `src/persistence/paths.ts`: 持久化根目录与文件路径解析
- `src/persistence/registry.ts`: 进程级 store 注册与统一 flush

**常用命令：**

```bash
npx gulp editor-common:build
npx gulp editor-common:typecheck
npx gulp editor-common:lint
```

**注意事项：**

- `setTimeout` 必须显式传入延迟参数。每个 PuerTS 入口（editor `main.ts` / tests `puertsPolyfill.ts` / acp-client CLI `index.ts`）应在最早期调用 `installPuertsTimerPolyfill()`，让 universe-lib / MCP SDK / ACP SDK 等第三方代码省略 delay 的 `setTimeout(fn)` 也能按 0ms 调度，避免链路推不动直至命中默认 60s 超时。
- PuerTS V8 prebuilt 不带 `TextEncoder`/`TextDecoder`/`AbortController`/`Buffer`。`installPuertsTimerPolyfill()` 已自动注入 codec 与 AbortController 的最小实现，能让 `universe-lib`（VSBuffer.fromString 回退路径）和 `@modelcontextprotocol/sdk`（Protocol.connect 中 new AbortController）正常工作。Buffer 不做 polyfill —— universe-lib 走的是 `typeof Buffer === "undefined"` 的回退分支。
- 业务代码里不要直接用全局 `TextEncoder` / `TextDecoder`，请从 `@universe-agent/editor-common` 导入 `encodeUtf8` / `decodeUtf8`。`acp-client-ue/src/utf8.ts` 是从这里再导出的兼容入口。
- `fileIO.ts` 与 `paths.ts` 通过延迟 `require('ue')` 避免非 PuerTS 环境导入时报错。
- tests 中允许保留测试场景专用 helper，但底层 `UeIpcSocket` 不应再重复实现。
- 业务代码请使用 `createLogger('<pkg>:<module>')` 取代直接 `console.*`；每个 PuerTS 入口应在最早期调用 `installConsoleOverride('<root>')`，让第三方库的 `console.*` 也被重定向到 `UJsLogHelper`，避免与 GLog 并发写 stdout 时的字节级交错。
- `standalone/` 下的独立 Node 子进程脚本不要引用本模块（无 PuerTS 环境），保留 `console.*`。
