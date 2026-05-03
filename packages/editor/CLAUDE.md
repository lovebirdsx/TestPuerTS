## CLAUDE.md

React UMG 编辑器组件库，基于 React 19 + react-reconciler 实现 UMG Widget 渲染。

**构建输出：** `Content/JavaScript/editor/`（composite 模式，生成 .d.ts，被 tests 包引用）

**关键文件：**

| 文件                                | 说明                                                   |
| ----------------------------------- | ------------------------------------------------------ |
| `src/index.ts`                      | 公共 API 导出（IWidgetRoot、UEWidget 等）              |
| `src/main.ts`                       | 编辑器初始化入口                                       |
| `src/common/umgRenderer.ts`         | 核心 React reconciler for UMG（16KB）                  |
| `src/common/reactTab.ts`            | Tab 管理组件                                           |
| `src/common/menu.ts`                | TsEditor 动态菜单注册封装                              |
| `src/common/watcher.ts`             | 文件/属性监听                                          |
| `src/components/`                   | UI 组件（SamplePanel、AcpClientPanel 等）              |
| `src/components/ui.tsx`             | 通用 UI 封装组件（Panel/VBox/HBox/Btn/Text）           |
| `src/mixin/mainEuw.ts`              | UE 主窗口集成                                          |

**测试：**

editor 包不再持有独立的测试套件。所有需要在 PuerTS 引擎中验证 editor 行为的测试（包括 persistence）统一放在 `packages/tests/src/`，通过 `npx gulp ue:test` 运行。

**常用命令：**

```bash
npx gulp editor:build       # 编译
npx gulp editor:watch       # 监听
npx gulp editor:typecheck   # 类型检查 + 循环依赖检查
npx gulp editor:lint:fix    # lint 自动修复
```

**ACP Client UI：**

- `src/components/AcpClientPanel.tsx` 在独立编辑器 Tab 中提供 ACP 客户端界面。
- 协议和权限逻辑来自 `@universe-agent/acp-client-ue` 的 `AcpUiController`。
- Tab 生命周期由 `main.ts` 管理，编辑器停止时关闭 Tab 并触发控制器清理。
- 新建 / 加载 session 时自动通过 `McpManager`（见下文）启动内置 ue-editor MCP server，并把 entry 注入 `controller.setMcpServers(...)`，传递给 ACP `session/new`。

**MCP 集成（`src/mcp/`）：**

把"UE 编辑器自身能力"作为 MCP server 暴露给 ACP agent。每个 ACP session 对应一组独立的命名管道 + MCP server 实例。

| 文件         | 说明                                                               |
| ------------ | ------------------------------------------------------------------ |
| `config.ts`  | 项目根 `mcp-servers.json` 的 zod schema + `loadMcpServersConfig()` |
| `manager.ts` | `McpManager`：startSession / stopSession / buildSessionMcpList     |

**配置文件：** `<ProjectDir>/mcp-servers.json`（git 入库友好）

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

**关键注意：**

- 内置 ue-editor server 的 ACP entry 形如 `{ name: 'ue-editor', command: 'node', args: ['<projectDir>/packages/mcp-bridge/dist/main.js', '--pipe', '<pipeName>'] }`，agent 收到后会自动 spawn bridge 进程；bridge 通过 universe-lib 命名管道接入 editor 内的 `mcp-server-ue`。
- 真正的 MCP 协议处理在 editor 进程（PuerTS）中（`@universe-agent/mcp-server-ue`），bridge 只做 stdio↔pipe 透明中继。
- session 关闭 / panel unmount 时务必调 `mcpManager.stopSession()` 释放命名管道。
- 修改 `mcp-servers.json` 后需重新打开 session（`McpManager.loadConfig(true)` 强刷或重启 panel）。
