## CLAUDE.md

ACP 协议客户端，用于调试和测试 ACP 服务端；包含命令行 REPL、ReactUMG UI 复用的控制器，以及 MCP 自动接线 facade。

**核心结构：**

- `src/index.ts`：CLI 入口（shebang）
- `src/cli.ts`：参数解析（含 `--no-mcp` / `--mcp-config`）
- `src/client.ts`：`ACPClient` 连接、会话、权限、文件/终端能力
- `src/renderer.ts`：CLI 协议消息渲染输出
- `src/repl.ts`：交互式 REPL
- `src/uiController.ts`：ReactUMG UI 复用的事件控制器（纯协议层）
- `src/acpClient.ts`：`AcpClient` facade：组合 `AcpUiController` + `McpManager`
- `src/mcp/config.ts`：项目根 `mcp-servers.json` 的 zod schema + `loadMcpServersConfig()`
- `src/mcp/manager.ts`：`McpManager`：startSession / stopSession / buildSessionMcpList
- `src/public.ts`：对 editor 包暴露的公共 API

**关键概念：**

- 可执行文件：`universe-agent-acp-client`
- `-P` 开启协议观察模式，查看原始 JSON-RPC 消息
- `--permission` 支持 interactive / auto-approve / deny-all 三种模式
- `--no-mcp` 关闭 MCP（仅调试 ACP 协议）；`--mcp-config <path>` 覆盖默认 `<ProjectDir>/mcp-servers.json`
- REPL 命令：`/session new`、`/mode`、`/protocol`、`/cancel` 等
- UI 入口通过 `AcpUiController` 订阅 typed events，不直接写 stdout/stderr
- 新版会话配置优先使用 `configOptions` / `session/set_config_option`，旧 `modes` 作为兼容路径
- 通过 `npx gulp ue:acp-client --acp-args="<整段字符串>"` 透传 CLI 选项（gulp 5 不认 POSIX `--`，整段透传，acp-client 自己拆）。默认 `--protocol --verbose` 仍自动追加，例：`npx gulp ue:acp-client --acp-args="--mode auto-approve --session abc"`

**MCP 集成（AcpClient facade）：**

`AcpClient` 把 MCP 生命周期与 ACP session 强绑定，editor 面板与 CLI 都开箱即用：

- 构造 `new AcpClient({ command, workspace, ..., mcp? })`：`mcp` 省略走默认（读取 `<ProjectDir>/mcp-servers.json`）；传 `false` 旁路；传 `McpManagerOptions` 自定义路径或 bridge entry。
- `await client.newSession()` / `await client.loadSession(id)` 内部先 `mcp.buildSessionMcpList(...)` 启动命名管道 server，再 `controller.setMcpServers(entries)`，最后调下层；返回 `{ warnings: string[] }` 由调用方决定如何展示（UI 渲染 system message、CLI 写 stderr）。
- 连续 newSession：旧 session 的 MCP 句柄会先被 `stopSession()` 释放再启新的。
- `await client.dispose()`：释放当前 MCP session + 关闭 controller，editor panel unmount / CLI 退出都走它。
- `client.controller` 暴露原始 `AcpUiController`，UI 直接 `subscribe` / `getState`，无需 facade 透传所有事件。
- 真正的 MCP 协议处理走 `@universe-agent/mcp-server-ue`（在调用方进程内），通过 `@universe-agent/mcp-bridge` 把命名管道桥接成 agent 看到的 stdio MCP server。

**Session 归属：**

`AcpUiController` 把 `session/update` 通知里的 `sessionId` 透传到所有 session-bound 事件（`message_chunk` / `thought_chunk` / `plan_updated` / `tool_call_updated` / `commands_updated` / `mode_updated` / `config_options_updated` / `session_info_updated` / `usage_updated`）。订阅方据此做归属过滤，避免新旧会话事件混合（典型场景：`switchSession` 期间旧 session 的 in-flight 工具调用通知到达）。`session_changed` / `protocol_message` / `permission_requested` / `prompt_finished` / `error` 等连接级事件不带 sessionId。

**配置文件：** `<ProjectDir>/mcp-servers.json`

```json
{
  "enabled": true,
  "builtin": { "ueEditor": { "enabled": true } },
  "external": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

修改后需重新打开 session（`McpManager.loadConfig(true)` 强刷或重启 facade）。

**测试：**

集成测试在 `packages/tests/src/acpClient/`：
- `jsonrpc.test.ts` — JsonRpcConnection 的 observer / server-side / 关闭 / 粘包 / 通知
- `acpClient.test.ts` — `ACPClient` API（initialize/newSession/prompt/cancel/setConfigOption/disconnect）+ `buildSpawnArgs` 纯函数
- `acpClientHandler.test.ts` — `ACPClientHandler` 的 fs/permission/terminal 路径（走真实 `UE.ProcessIOHelper`/`UE.JsRunHelper.SpawnProcess`）
- `controllerIntegration.test.ts` — `AcpUiController` 事件派发 + `setMcpServers` 注入
- `mcpManager.test.ts` — `McpManager` + `parseMcpServersConfig`（生命周期、配置缓存 / 解析失败 / schema 警告、ue-editor entry 拼装、env record 转换）
- `acpClient.realProcess.test.ts` — `ChildProcessTransport` smoke，`UNIVERSE_ACP_E2E=1` 启用；可选 `UNIVERSE_ACP_SERVER_CMD` 指向真实 ACP server

为支持测试注入，`ACPClient` 构造函数和 `AcpUiController` 构造函数都接受可选的 `transportFactory` 参数（默认走 `spawnAcpServer`）。`buildSpawnArgs(options)` 抽成纯函数便于单测。`AcpClient` facade 的覆盖通过 `packages/tests/src/editor/acp/panel.test.tsx` 的 `MockAcpClient` 间接验证。
