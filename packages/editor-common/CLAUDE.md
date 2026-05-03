## CLAUDE.md

editor-common 是 editor、mcp-server-ue、tests 共享的 Unreal 关联基础模块包。

**构建输出：** `Content/JavaScript/editor-common/`（composite，生成 .d.ts 供其他包引用）

**职责边界：**

- 提供与 UE/PuerTS 运行时相关但不包含 UI 的公共实现。
- 当前包含两类能力：
  - IPC 基础层：`BridgeLink`、`UeIpcSocket`
  - 持久化层：`defineStore`、`PersistenceStore`、`flushAllPersistence`、`ueFileIO`
- 不承载 editor UI、MCP tool 业务逻辑、测试专用断言工具。

**关键文件：**

| 文件                          | 说明                                  |
| ----------------------------- | ------------------------------------- |
| `src/index.ts`                | 包级导出入口                          |
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
