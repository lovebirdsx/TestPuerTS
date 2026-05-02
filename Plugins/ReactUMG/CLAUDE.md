## CLAUDE.md

React 风格 UMG UI 框架插件，支持在 JS/TS 中以声明式方式构建 UE 界面。

**模块（2 个）：**

| 模块                      | 类型    | 说明                                |
| ------------------------- | ------- | ----------------------------------- |
| ReactUMG                  | Runtime | 核心运行时：Widget 管理、子节点增删 |
| ReactDeclarationGenerator | Editor  | 生成 react-umg TypeScript 类型声明  |

**关键文件：**

| 文件                            | 说明                                                      |
| ------------------------------- | --------------------------------------------------------- |
| `Source/ReactUMG/ReactWidget.h` | UReactWidget：扩展 UUserWidget，管理 RootSlot 和子 Widget |
| `Source/ReactUMG/UMGManager.h`  | Widget 生命周期管理                                       |
| `Source/ReactUMG/UMGRoot.h`     | 根 Widget 实现                                            |
| `Source/ReactUMG/IReactUMG.h`   | 模块接口（Get/IsAvailable）                               |
| `Typing/react-umg/index.d.ts`   | React UMG API 的 TypeScript 类型定义                      |

**依赖：** Puerts 插件（JsEnv 提供 JS 运行时）

**与 TS 侧的关系：** `packages/editor` 中的 `umgRenderer.ts` 是 React reconciler 实现，与此插件的 C++ 层配合工作。
