## CLAUDE.md

React UMG 编辑器组件库，基于 React 19 + react-reconciler 实现 UMG Widget 渲染。

**构建输出：** `Content/JavaScript/editor/`（composite 模式，生成 .d.ts，被 tests 包引用）

**关键文件：**

| 文件                        | 说明                                      |
| --------------------------- | ----------------------------------------- |
| `src/index.ts`              | 公共 API 导出（IWidgetRoot、UEWidget 等） |
| `src/main.ts`               | 编辑器初始化入口                          |
| `src/common/umgRenderer.ts` | 核心 React reconciler for UMG（16KB）     |
| `src/common/reactTab.ts`    | Tab 管理组件                              |
| `src/common/watcher.ts`     | 文件/属性监听                             |
| `src/components/`           | UI 组件（SamplePanel 等）                 |
| `src/components/ui.tsx`     | 通用 UI 封装组件（VBox/HBox/Btn/Text）    |
| `src/mixin/mainEuw.ts`      | UE 主窗口集成                             |

**测试：**

* `src/unittests/` — vitest 单元测试（`npx gulp editor:test`）
* `src/tests/` — 集成测试

**常用命令：**

```bash
npx gulp editor:build       # 编译
npx gulp editor:watch       # 监听
npx gulp editor:test        # 运行 vitest 测试
npx gulp editor:typecheck   # 类型检查 + 循环依赖检查
npx gulp editor:lint:fix    # lint 自动修复
```
