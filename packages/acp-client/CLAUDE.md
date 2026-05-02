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
