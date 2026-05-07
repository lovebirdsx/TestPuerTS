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

- `AcpClientPanel.tsx` 是编辑器内 ACP 客户端主界面。
- 通过 `clientFactory: (opts) => AcpClient` 接收 facade；UI 只消费 `client.controller` 的事件，不直接处理 JSON-RPC transport。
- MCP 由 `AcpClient` 自动管理，Panel 不再持有 `mcpManagerRef` / `mcpSessionIdRef`；`disconnect` / unmount 调 `client.dispose()`。
- 权限请求以 `ModalPanel` 展示，必须调用 pending permission 的 `resolve()` 或 `cancel()`。
- 持久化配置走 `acpPanelConfigStore`（模块级单例，落到 `<AppData>/<Project>/EditorPersistence/acp-client-panel.json`）。测试若需隔离 store 状态，请通过 `configStore` prop 注入由 `createAcpPanelConfigStore(name, { fileIO })` 构造的内存版本，避免共享单例的异步 `ready()` 与持久化数据在多个用例间产生副作用。
