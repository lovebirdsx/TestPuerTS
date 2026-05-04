## CLAUDE.md

editor-common 是 editor、mcp-server-ue、tests 共享的 Unreal 关联基础模块包。

**构建输出：** `Content/JavaScript/editor-common/`（composite，生成 .d.ts 供其他包引用）

**职责边界：**

- 提供与 UE/PuerTS 运行时相关但不包含 UI 的公共实现。
- 当前包含三类能力：
  - 日志层：`createLogger`、`installConsoleOverride`
  - IPC 基础层：`BridgeLink`、`UeIpcSocket`
  - 持久化层：`defineStore`、`PersistenceStore`、`flushAllPersistence`、`ueFileIO`
- 不承载 editor UI、MCP tool 业务逻辑、测试专用断言工具。

**关键文件：**

| 文件                          | 说明                                  |
| ----------------------------- | ------------------------------------- |
| `src/index.ts`                | 包级导出入口                          |
| `src/logging/index.ts`        | `createLogger(category)` / `installConsoleOverride(rootCategory)`：包装 `UE.JsLogHelper` 让 JS 输出统一走 `UE_LOG(LogJs)` |
| `src/ipc/bridgeLink.ts`       | bridge 双向链路接口定义               |
| `src/ipc/ueIpcSocket.ts`      | `UE.IPCTransport` 到 `ISocket` 的适配 |
| `src/persistence/store.ts`    | zod 驱动的类型化持久化 store 实现     |
| `src/persistence/fileIO.ts`   | `UE.ProcessIOHelper` Promise 化封装   |
| `src/persistence/paths.ts`    | 持久化根目录与文件路径解析            |
| `src/persistence/registry.ts` | 进程级 store 注册与统一 flush         |

**常用命令：**

```bash
npx gulp editor-common:build
npx gulp editor-common:typecheck
npx gulp editor-common:lint
```

**注意事项：**

- `setTimeout` 必须显式传入延迟参数。
- `fileIO.ts` 与 `paths.ts` 通过延迟 `require('ue')` 避免非 PuerTS 环境导入时报错。
- tests 中允许保留测试场景专用 helper，但底层 `UeIpcSocket` 不应再重复实现。
- 业务代码请使用 `createLogger('<pkg>:<module>')` 取代直接 `console.*`；每个 PuerTS 入口（editor `main.ts` / tests `puertsPolyfill.ts`）应在最早期调用 `installConsoleOverride('<root>')`，让第三方库（universe-lib、ACP SDK、MCP SDK 等）的 `console.*` 也被重定向到 `UJsLogHelper`，避免与 GLog 并发写 stdout 时的字节级交错。
- `standalone/` 下的独立 Node 子进程脚本不要引用本模块（无 PuerTS 环境），保留 `console.*`。
