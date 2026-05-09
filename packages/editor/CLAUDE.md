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

- `src/components/AcpClientPanel/` 在独立编辑器 Tab 中提供 ACP 客户端界面，VSCode Copilot 风格的纵向单列布局：`TopBar`（连接状态 / 会话标签 / + New / 三个抽屉切换 / Connect-Disconnect / Cancel）+ 主对话区（`MessageStream` + `InputArea`）+ 右侧条件渲染的 360px `Drawer`（横向挤压主区域）。目录按领域分包（store/slices/eventSink + domain/{topbar,session,prompt,drawer,inspector,permission,policy} + hooks）。
- 状态管理：zustand v5 + immer + persist 中间件，单一 store 内含 connection/session/prompt/conversation/inspector/ui/permission/policy/config 字段；事件流通过 `ingestEvent` 投影到 store，UI 组件按需 `useStoreSelector` / `useStoreAction` 订阅，零 props drilling。`activeDrawer`（`'history' | 'settings' | 'debug' | undefined`）由 `setActiveDrawer` / `toggleDrawer` 切换，**不持久化**。
- `AcpClient` facade（来自 `@universe-agent/acp-client-ue`）由 store 内部按 `clientFactory` 实例化；MCP 生命周期由 `AcpClient` 自动管理，Panel 卸载时统一调 `client.dispose()`。
- 持久化：zustand persist + 自定义 ueStorage 适配器写 `<ProjectDir>/EditorPersistence/acp-panel.json`，仅落 `{ config, policy, inspector.activeTab }`。旧 schema `acp-client-panel.json` / `acpPanelConfigStore` / `usePersistedState` 已下线。
- Session 管理：服务端 `session/list` 为唯一来源，单活动会话 + History 抽屉切换。store 提供 `refreshSessions()`/`switchSession(id)`/`newSession()`，`connect()` 后自动 `refreshSessions()`；切换/新建前调 `resetSessionRuntime` 清空 messages/tools/plan/protocol/usage 等运行态。`ingestEvent` 对 session-bound 事件按 `event.sessionId === s.sessionId` 过滤丢弃跨会话尾随事件；切换时先乐观置入新 sessionId，加载失败回滚。UI 由 `domain/session/SessionPicker.tsx`（包装在 History 抽屉内）展示历史列表 + Active 高亮 + New/Refresh，旧的「输入 ID → Load」流程已下线。
- 调试信息：`domain/inspector/Inspector.tsx`（包装在 Debug 抽屉内）保留 Protocol / State / Commands 三 tab；连接 profile 选择 + auto-connect + Policy + Mode + 可变 configOptions 集中在 Settings 抽屉。Mode / Policy 两个最常用的选项在 InputArea 底部内联快捷选择。
- 测试隔离：`createAcpPanelStore({ clientFactory, persistName, storage })` 工厂可注入 mock client + 内存 storage，详见 `packages/tests/src/acpPanel/`。
