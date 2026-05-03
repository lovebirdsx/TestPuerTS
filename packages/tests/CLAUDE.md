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
npx gulp ue:test              	# 通过 JsRunnerCommandlet 运行测试
npx gulp tests:watch          	# 监听编译，成功后自动运行 ue:test
```

**注意：** `universe-lib` 通过 `ExtraSearchPaths`（指向项目根目录）在运行时解析模块。
