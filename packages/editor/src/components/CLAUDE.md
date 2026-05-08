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
- `VBox` / `HBox` 的 `Gap` 通过 child `Slot.Padding` 实现，业务组件不要重复手写间距逻辑。

**ACP Client Panel：**

- `AcpClientPanel/` 是编辑器内 ACP 客户端主界面，按领域目录拆分（`store/` + `domain/{connection,session,prompt,inspector,permission,policy}` + `hooks/`）。
- 状态管理基于 zustand v5 + immer + persist 中间件：单一 store 内含 connection/session/prompt/conversation/inspector/permission/policy/config 8 个领域字段；事件流通过统一的 `ingestEvent` 投影到 store（`store/index.ts`），不再读 `controller.getState()`。
- 组件无 props drilling：`AcpClientPanel.tsx` 仅做布局组装，子组件按需 `useStoreSelector(s => ...)` / `useStoreAction('xxx')` 订阅。
- `AcpClient` facade 由 store 内部通过 `clientFactory`（默认从 `@universe-agent/acp-client-ue` 加载）按需实例化；测试通过 `createAcpPanelStore({ clientFactory, storage })` 注入 mock。
- MCP 仍由 `AcpClient` 自动管理，`disconnect` / unmount 调 `client.dispose()`。
- 权限请求由 `domain/permission/PermissionModal.tsx` 渲染 `ModalPanel`，必须调用 `resolvePermission(optionId)` 或 `cancelPermission()`。
- 持久化通过 zustand persist + 自定义 ueStorage 适配器写到 `<AppData>/<Project>/EditorPersistence/acp-panel.json`；`partialize` 仅持久化 `{ config, policy: { permission, protocolEnabled }, inspector: { activeTab } }`，运行时字段（messages/tools/protocol/sessionId 等）不入盘。
