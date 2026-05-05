## CLAUDE.md

ACP 协议客户端，用于调试和测试 ACP 服务端；包含命令行 REPL 和编辑器 UI 复用的控制器。

**核心结构：**

| 文件                  | 说明                                        |
| --------------------- | ------------------------------------------- |
| `src/index.ts`        | CLI 入口（shebang）                         |
| `src/cli.ts`          | 参数解析                                    |
| `src/client.ts`       | `ACPClient` 连接、会话、权限、文件/终端能力 |
| `src/renderer.ts`     | CLI 协议消息渲染输出                        |
| `src/repl.ts`         | 交互式 REPL                                 |
| `src/uiController.ts` | ReactUMG UI 复用的事件控制器                |
| `src/public.ts`       | 对 editor 包暴露的公共 API                  |

**关键概念：**

- 可执行文件：`universe-agent-acp-client`
- `-P` 开启协议观察模式，查看原始 JSON-RPC 消息
- `--permission` 支持 interactive / auto-approve / deny-all 三种模式
- REPL 命令：`/session new`、`/mode`、`/protocol`、`/cancel` 等
- UI 入口通过 `AcpUiController` 订阅 typed events，不直接写 stdout/stderr
- 新版会话配置优先使用 `configOptions` / `session/set_config_option`，旧 `modes` 作为兼容路径
- 通过 `npx gulp ue:acp-client --acp-args="<整段字符串>"` 透传 CLI 选项（gulp 5 不认 POSIX `--`，整段透传，acp-client 自己拆）。默认 `--protocol --verbose` 仍自动追加，例：`npx gulp ue:acp-client --acp-args="--mode auto-approve --session abc"`

**测试：**

集成测试在 `packages/tests/src/acpClient/`：
- `jsonrpc.test.ts` — JsonRpcConnection 的 observer / server-side / 关闭 / 粘包 / 通知
- `acpClient.test.ts` — `ACPClient` API（initialize/newSession/prompt/cancel/setConfigOption/disconnect）+ `buildSpawnArgs` 纯函数
- `acpClientHandler.test.ts` — `ACPClientHandler` 的 fs/permission/terminal 路径（走真实 `UE.ProcessIOHelper`/`UE.JsRunHelper.SpawnProcess`）
- `controllerIntegration.test.ts` — `AcpUiController` 事件派发 + `setMcpServers` 注入
- `acpClient.realProcess.test.ts` — `ChildProcessTransport` smoke，`UNIVERSE_ACP_E2E=1` 启用；可选 `UNIVERSE_ACP_SERVER_CMD` 指向真实 ACP server

为支持测试注入，`ACPClient` 构造函数和 `AcpUiController` 构造函数都接受可选的 `transportFactory` 参数（默认走 `spawnAcpServer`）。`buildSpawnArgs(options)` 抽成纯函数便于单测。
