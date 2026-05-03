## CLAUDE.md

PuerTS 内 MCP（Model Context Protocol）Server 实现，把 UE 编辑器能力作为 MCP tools 暴露给 ACP agent。

**构建输出：** `Content/JavaScript/mcp-server-ue/`（composite，被 editor 包引用）

**关键决策：**

* 基于 `@modelcontextprotocol/sdk` 的 `McpServer` 实现。
* SDK 通过 `package.json` exports 限制了子路径，PuerTS `require()` 不解析 exports；因此运行时 require 走 `@modelcontextprotocol/sdk/dist/cjs/...`，TS 类型解析通过 `tsconfig.json` 的 `paths` 重定向到 `dist/esm/*.d.ts`（运行时无影响，仅供 tsc 找类型）。

**架构：**

```
agent stdio  ──►  mcp-bridge (Node)  ──►  pipeServer  ──►  BridgeTransport  ──►  SDK McpServer  ──►  UE API
              ndjson                 universe-lib       JSONRPCMessage         registerTool(zod)
```

**关键文件：**

| 文件                          | 说明                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| `src/index.ts`                | 公共 API：`startUeMcpServer(options)` 一站式入口；返回 `UeMcpServerHandle` |
| `src/bridgeTransport.ts`      | `BridgeLink` ↔ SDK `Transport` 适配：ndjson 行 ↔ `JSONRPCMessage`          |
| `src/pipeServer.ts`           | `serveOnPipe(name)`：把 universe-lib 双向通道适配为 `BridgeLink`           |
| `src/tools/echo.ts`           | 内置 tool：connectivity 探活                                               |
| `src/tools/listAssets.ts`     | 内置 tool：`EditorAssetSubsystem.ListAssets`（仅 editor 模式可用）         |
| `src/tools/getProjectInfo.ts` | 内置 tool：`UE.JsRunHelper.GetProjectDir()`                                |
| `src/tools/index.ts`          | `registerBuiltinTools(server)` 集中注册                                    |

**新增 Tool 流程：**

1. 在 `src/tools/` 下新建文件，导出 `registerXxxTool(server: McpServer)` 函数，内部调 `server.registerTool(name, config, handler)`：
   - `config.inputSchema` 传 zod raw shape：`{ message: z.string(), count: z.number().optional() }`，**不要传 `z.object({...})` 包装后的对象**（SDK 内部会自己包）。
   - handler 直接拿到已校验的强类型参数，返回 `{ content: ContentBlock[] }` 或 `{ isError: true, content: [...] }`。
2. 在 `src/tools/index.ts` 的 `registerBuiltinTools()` 中调用新函数。
3. 异步 tool：handler 返回 `Promise<...>` 即可。
4. handler 抛错由 SDK 统一转成 `{ isError: true, content: [{ type: 'text', text: <err.message> }] }`。

**典型用法（editor 端，每个 ACP session 独立）：**

```ts
import { startUeMcpServer } from '@universe-agent/mcp-server-ue';

const handle = startUeMcpServer({ pipeName: '\\\\.\\pipe\\ue-mcp-' + sessionId });
// 把以下条目放进 ACP session/new 的 mcpServers 字段：
//   { name: 'ue-editor', command: 'node', args: ['<repoRoot>/packages/mcp-bridge/dist/main.js', '--pipe', handle.pipeName] }
// agent 启动 bridge 后会触发：
const server = await handle.ready(); // 拿到 SDK McpServer，可继续 server.registerTool(...) 追加
// session 结束时：
handle.dispose();
```

**注意事项：**

* `EditorAssetSubsystem` 在 commandlet 环境中为 null，相关 tool 应优雅返回 `isError: true`。
* `tools/call` 返回值统一为 `{ content: ContentBlock[], isError?: boolean }`；不要直接把 raw object 当 result（agent 会拒绝）。
* 一个 pipe 一对一服务一个 bridge / 一个 session；多 session 用不同 pipe 名。
