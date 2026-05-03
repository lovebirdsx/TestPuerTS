## CLAUDE.md

stdio↔命名管道桥接进程，让 ACP agent 可通过标准 MCP stdio spawn 模型连接到 editor 内的 MCP Server。

**构建输出：** `dist/`（tsc CommonJS）

**可执行：** `ue-mcp-bridge`（`bin` 字段）

**架构定位：**

```
agent ── spawn(node main.js --pipe X) ──► bridge ── universe-lib client ──► editor server
              stdio (ndjson)                              named pipe
```

bridge 不解析 MCP 协议，只做透明 ndjson 行转发：
- agent stdin 行 → `forwardFromAgent(line)` → editor 内 MCP Server
- editor 推回 → `pushToAgent(line)` → bridge stdout → agent

**关键文件：**

| 文件               | 说明                                                     |
| ------------------ | -------------------------------------------------------- |
| `src/main.ts`      | CLI 入口（shebang），解析 `--pipe`，调用 `runBridge`     |
| `src/runBridge.ts` | 核心：connect editor pipe + 注册回调通道 + readline 转发 |
| `src/shared.ts`    | 与 editor 共享的 ProxyChannel 服务/回调接口              |

**通道约定：** `BRIDGE_CHANNEL='mcp-bridge'`（editor → bridge 服务）+ `BRIDGE_CALLBACK_CHANNEL='mcp-bridge-callback'`（bridge → editor 回调）。

**运行方式：** 不应被人工启动，由 ACP agent 通过 `mcpServers` 配置 spawn。手工调试时：
```bash
node packages/mcp-bridge/dist/main.js --pipe '\\.\pipe\ue-mcp-debug'
```

**为何不在 editor 内 spawn：** MCP 协议规定 server 由 agent spawn；editor 改为预先 `serve(pipe)`，把 `node bridge.js --pipe ...` 命令通过 ACP `session/new` 的 `mcpServers` 传给 agent，agent 自行 spawn。
