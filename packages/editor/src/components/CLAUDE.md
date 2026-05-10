**通用 UI 组件（`src/components/ui.tsx`）：**

封装 ReactUMG 原始组件，内置 UE5.5 编辑器 Dark 主题默认样式，关键引擎源码参考（位于 `Engine/Source/Runtime/SlateCore/`）：

| 文件                                    | 内容                                                     |
| --------------------------------------- | -------------------------------------------------------- |
| `Private/Styling/StyleColors.cpp`       | Dark 主题 `EStyleColor` HEX 色表                         |
| `Private/Styling/StarshipCoreStyle.cpp` | Slate 按钮/文字/输入框样式定义                           |
| `Private/Styling/UMGCoreStyle.cpp`      | UMG 默认样式（固定色，不跟主题）                         |
| `Public/Styling/CoreStyle.h`            | `ButtonMargins`、`InputFocusThickness` 等常量            |
| `Public/Styling/SlateBrush.h`           | `ESlateBrushDrawType` 枚举（NoDrawType=0、RoundedBox=4） |

**组件约定：**

- 基础布局和按钮使用 `Panel` / `VBox` / `HBox` / `Btn` / `ToolbarButton` / `Text`。
- 表单和工作台界面使用 `Input` / `TextArea` / `ScrollArea` / `Select` / `Section` / `Badge` / `Tabs` / `ModalPanel`。
- 图标按钮使用 `Icon` / `IconBtn`：`Icon` 通过 `UE.EditorIconHelper.GetEditorIcon(Name)` 从 `FAppStyle` 取 brush（IconName 见 `Engine/Source/Editor/EditorStyle/Private/SlateEditorStyle.cpp` 与 `StarshipCoreStyle.cpp`，例如 `Icons.Plus` / `Icons.Settings` / `Icons.History.Recent` / `Icons.X` / `Icons.Refresh` / `Icons.Save` / `Icons.Console` / `Icons.Plug` / `Icons.ArrowLeft`）；`IconBtn` 包一层 `Button` 提供 `ToolTipText` 与 `Active` 高亮。
- `VBox` / `HBox` 的 `Gap` 通过 child `Slot.Padding` 实现，业务组件不要重复手写间距逻辑。

**ACP Client Panel：**

- `AcpClientPanel/` 是编辑器内 ACP 客户端主界面，VSCode Copilot 风格的纵向布局：
  - **TopBar**（纯图标按钮）：➕New / 🕘History（toggle 高亮） / ⚙Settings（toggle 高亮） / 📤Export Protocol JSON / 📋Log State / 🔌Connect-Disconnect / ✖Cancel；不再显示 status / agent / session 文字。
  - **主区域**：当 `activeDrawer === 'history'` 时由 `SessionPicker` 全占主列（替换式，VSCode Copilot 行为，左上角 ← 返回按钮）；否则渲染 `MessageStream` + `InputArea`。
  - **MessageStream**：纯滚动列表，无 "Conversation" 标题与 Clear 按钮。
  - **InputArea**：TextArea 上方先显示 select 类 configOptions（model / effort 等下拉）；再显示 CommandsPanel（加 `SizeBox MaxDesiredHeight={160}` + ScrollArea 防超框）；TextArea；底部工具栏（`Icons.Filter` Commands 弹出 / Spacer / 任务进行中显示转菊花 SpinnerBtn（点击取消）否则显示 Send（`Icons.ChevronRight`））；无独立 Cancel 按钮。
  - **Settings 抽屉**：仅当 `activeDrawer === 'settings'` 时，纵向显示在对话区上方（内容自适应高度）；包含连接 profile / auto-connect / boolean 类 configOptions（select 类已被 InputArea 接管）。
  - **PermissionModal** 仍为独立浮层。
- 状态管理基于 zustand v5 + immer + persist 中间件：单一 store 内含 connection/session/prompt/conversation/ui/permission/policy/config 字段；事件流通过统一的 `ingestEvent` 投影到 store（`store/index.ts`）。新增 `exportProtocol`（写 `<ProjectDir>/Saved/Logs/acp-protocol-{ts}.json` + `cmd /c start` 调系统默认程序打开） / `logStateToConsole`（用 `createLogger('acp-panel').info` 输出 snapshot 到 UE Output Log）两个 action。`activeDrawer ∈ {'history','settings'}`（debug 抽屉已下线）由 `setActiveDrawer` / `toggleDrawer` 控制，**不持久化**。
- `permission` / `protocolEnabled` 字段在 store 中保留以便 controller 同步（默认 `protocolEnabled = true` 让 export 始终有数据），但 UI 不再暴露策略选择。
- 组件无 props drilling：`AcpClientPanel.tsx` 仅做布局组装，子组件按需 `useStoreSelector(s => ...)` / `useStoreAction('xxx')` 订阅。
- `AcpClient` facade 由 store 内部通过 `clientFactory`（默认从 `@universe-agent/acp-client-ue` 加载）按需实例化；测试通过 `createAcpPanelStore({ clientFactory, storage })` 注入 mock。
- MCP 仍由 `AcpClient` 自动管理，`disconnect` / unmount 调 `client.dispose()`。
- 权限请求由 `domain/permission/PermissionModal.tsx` 渲染 `ModalPanel`，必须调用 `resolvePermission(optionId)` 或 `cancelPermission()`。
- 持久化通过 zustand persist + 自定义 ueStorage 适配器写到 `<AppData>/<Project>/EditorPersistence/acp-panel.json`；`partialize` 仅持久化 `{ config, policy: { permission, protocolEnabled } }`，运行时字段（messages/tools/protocol/sessionId/activeDrawer 等）不入盘。

**ACP 工具调用差异化展示（`domain/prompt/`）：**

`ToolCallCard.tsx` 不再 dump 全 JSON，而是按 ACP `ToolKind` 派发到对应 renderer。共用的 `[展开▶] [KindIcon] [描述/标题] [PathChip×3] [Status Badge]` 头部 + 专属 body：

- `blocks/`：`PathChip`（点击调 `EditorHelper.OpenSourceFileInIDE`）/ `ToolKindIcon`（`ToolKind` → `IconName` 映射）/ `CodeBlock`（**RichText 模式**：`UE.EditorHelper.BuildAcpCodeStyleSet()` 拉运行时 `UDataTable<FRichTextStyleRow>` 挂到 `RichTextBlock.TextStyleSet`，VBox 一行一个 RichTextBlock，markup 由 `linesToMarkup` 生成 `<hljs-*>...</>`；右上角 `Edit` 图标 `IconBtn` 切换到 plain 模式 → `SelectableText`，弥补 RichTextBlock 不支持选中复制；样式表加载失败时永久退到 plain）/ `TerminalBlock`（命令回显 + stdout/stderr 红色 + exitCode）/ `DiffView`（jsdiff `diffLines` unified 视图，`+/-/ ` 前缀 + 行内文本绿/红/灰）/ `openInEditor`（解析绝对路径 → `UE.EditorHelper.OpenSourceFileInIDE`）。
- `highlight/`：双通道语法着色 facade —— 优先 `lowlight@1.20.0`（CJS）按需注册 ts/js/json/bash/python/cpp/ini/markdown/diff，失败/异常自动落到正则 `fallback` 通道（覆盖 ts/json/bash/diff）。两条路径共用 `CodeToken{ text, className }` 模型，`detectLanguageByPath(path)` 按后缀映射 highlight.js 语言名。`richMarkup.ts` 的 `lineToMarkup` / `linesToMarkup` 把 `CodeLine[]` 序列化为 UE RichTextBlock markup（`<hljs-*>text</>`，转义 `& < > "` 实体），CodeBlock 直接消费。
- `contentTypes.ts` + `contentDispatcher.tsx`：把 ACP `ToolCallContent[]`（`{ type: 'content' | 'diff' | 'terminal' }`）的 `unknown` 归一为联合类型，按 type 分支渲染（text/image/diff/terminal/未知）。
- `toolKindRenderers/`：每个 kind 一个 `KindRenderer = { derivePaths(item), Body(item) }`：`ReadCard`（CodeBlock + `detectLanguageByPath`）/ `EditCard`（多个 DiffView + 头部累计 +N -M）/ `ExecuteCard`（TerminalBlock + ContentDispatcher 兜底）/ `DeleteCard` / `MoveCard`（from → to）/ `SearchCard`（pattern + 命中）/ `ThinkCard` / `FetchCard`（url + body）/ `SwitchModeCard`（from → to）/ `OtherCard`（保留旧 dump 兜底）。`getRendererForKind(kind)` 是单一派发入口，未注册 kind 走 `OtherCard`。
- `sharedExtractors.ts`：`extractPrimaryPath` / `extractCommand` / `extractTerminalOutput` 等共享工具，兼容 `path` / `file_path` / `absolute_path` 等不同 agent 习惯。

**第三方依赖（PuerTS modular 直接 require `node_modules`）：** `lowlight@^1.20.0`（v2+ 是 ESM-only，必须锁 v1）+ `diff@^5.2.0`，与 `zod` / `zustand` 同等待遇挂在 `packages/editor/package.json` 的 `dependencies`。`packages/tests/src/acpPanel/highlight.smoke.test.ts` 是冒烟门禁，第 1 步必跑。
