## CLAUDE.md

Commandlet 测试套件，通过 UE JsRunnerCommandlet 在引擎环境中运行。

**构建输出：** `Content/JavaScript/tests/`（tsc 编译，CommonJS 多文件输出）

**依赖：** `editor`（UI/reducer 导出）、`@universe-agent/editor-common`（IPC/persistence 公共实现）、`universe-lib`（IPC 框架）

**关键文件：**

| 文件                    | 说明                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| `src/main.ts`           | 测试入口，动态导入所有测试文件                                               |
| `src/testRunner.ts`     | 测试执行编排（vitest 风 DSL，含 `it.skip`/`describe.skip`/`expect.toThrow`） |
| `src/puertsPolyfill.ts` | PuerTS 环境 polyfill（setTimeout 等）                                        |
| `src/ueBindings/`       | PuerTS ↔ UE 绑定测试（基础类型、容器、delegate、actor、async）               |
| `src/ipc/`              | IPC/RPC 通信测试（client/server/service）                                    |
| `src/editorCommon/`     | EditorCommon 插件测试（ProcessIO、ChildProcess）                             |
| `src/editor/`           | editor 包功能测试（如 persistence）                                          |
| `src/reactUmg/`         | ReactUMG 集成测试（reconciler、widget）                                      |
| `src/mcp/`              | mcp-server-ue 测试（BridgeTransport、SDK Client ↔ McpServer 内存对环测试）   |
| `src/acpClient/`        | ACP 客户端集成测试（jsonrpc / ACPClient / Handler / McpManager / UiController；含 env 门控的真实子进程 smoke） |
| `src/standalone/`       | 独立 Node.js 进程脚本（配合 RPC 测试）                                       |

**运行方式：**

```bash
npx gulp tests:build          	# 编译
npx gulp ue:test              	# 通过 JsRunnerCommandlet 运行测试（跑完即退出）
npx gulp tests:watch          	# 旧 watch：监听 ts 源码 → 编译成功 → 每次 spawn 新 commandlet 跑 ue:test（每轮承担 UE 冷启动开销）
```

**长驻 watch 模式（推荐）：** 两个终端配合，commandlet 不退出，热重启 < 5s。

```bash
# 终端 A：仅 tsc -b -w，输出到 Content/JavaScript/tests
npx gulp tests:tsc:watch

# 终端 B：长驻 commandlet，C++ 端轮询 Content/JavaScript 下 .js 产物
# 检测到变化即销毁/重建 JsEnv 重跑测试；进程不退出
npx gulp ue:test:watch
```

退出 `ue:test:watch`：
- 在另一个 shell `touch Content/JavaScript/.watch-stop`（推荐）
- 或 Ctrl+C
- 或在 stdin 输入 `q` / `quit` / `exit`（仅 TTY 下有效）

实现细节：
- watch 逻辑在 C++ `JsRunnerCommandlet`（`Plugins/EditorCommon/Source/EditorCommon/Private/JsRunnerCommandlet.cpp`），命令行 `-watch`、可选 `-watch-root=<dir>`、`-watch-interval=<ms>`
- 文件快照通过 `UProcessIOHelper::ListFilesRecursive` 一次性拿到 mtime + size，由 `IFileManager::IterateDirectoryStatRecursively` 实现
- 测试本身（`main.ts` / `testRunner.ts`）零改动；每轮重建 `puerts::FJsEnv`，等价于一次冷启的 JS 语义
