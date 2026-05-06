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
| `src/hooks/usePersistedState.ts`    | 通用 hook：将 PersistenceStore 桥接为 React state      |
| `src/mixin/mainEuw.ts`              | UE 主窗口集成                                          |

**测试：**

editor 包不再持有独立的测试套件。所有需要在 PuerTS 引擎中验证 editor 行为的测试（包括 persistence）统一放在 `packages/tests/src/`，通过 `npx gulp ue:test` 运行。

**入口注意：** `src/main.ts` 必须在最早期调用 `installPuertsTimerPolyfill()`（再 `installConsoleOverride('editor')`），否则 universe-lib / MCP SDK 等省略 delay 的 `setTimeout(fn)` 不会触发，会导致 ACP `session/new` 卡死至 60s 超时。

**常用命令：**

```bash
npx gulp editor:build       # 编译
npx gulp editor:watch       # 监听
npx gulp editor:typecheck   # 类型检查 + 循环依赖检查
npx gulp editor:lint:fix    # lint 自动修复
```

**ACP Client UI：**

- `src/components/AcpClientPanel.tsx` 在独立编辑器 Tab 中提供 ACP 客户端界面。
- Panel 通过 `clientFactory` prop 接收一个 `AcpClient` facade（来自 `@universe-agent/acp-client-ue`），内部组合了 `AcpUiController` + `McpManager`。
- MCP 生命周期由 `AcpClient` 自动管理：`newSession()` / `loadSession()` 启动并注入内置 ue-editor MCP server 的 entry，`dispose()` 在断开/卸载时统一释放命名管道。Panel 不再持有任何 `mcpManagerRef`。
- `newSession()` / `loadSession()` 的返回值含 `warnings: string[]`，Panel 渲染为 system message。
- Tab 生命周期由 `main.ts` 管理，编辑器停止时关闭 Tab 并触发 `client.dispose()`。

**MCP 配置：** `<ProjectDir>/mcp-servers.json`（详见 `packages/acp-client-ue/CLAUDE.md`）。editor 包不再直接依赖 `@universe-agent/mcp-server-ue`，所有 MCP 启停均走 `AcpClient`。
