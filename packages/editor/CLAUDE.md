## CLAUDE.md

React UMG 编辑器组件库，基于 React 19 + react-reconciler 实现 UMG Widget 渲染。

**构建输出：** `Content/JavaScript/editor/`（composite 模式，生成 .d.ts，被 tests 包引用）

**关键文件：**

| 文件                        | 说明                                         |
| --------------------------- | -------------------------------------------- |
| `src/index.ts`              | 公共 API 导出（IWidgetRoot、UEWidget 等）    |
| `src/main.ts`               | 编辑器初始化入口                             |
| `src/common/umgRenderer.ts` | 核心 React reconciler for UMG（16KB）        |
| `src/common/reactTab.ts`    | Tab 管理组件                                 |
| `src/common/menu.ts`        | TsEditor 动态菜单注册封装                    |
| `src/common/watcher.ts`     | 文件/属性监听                                |
| `src/components/`           | UI 组件（SamplePanel、AcpClientPanel 等）    |
| `src/components/ui.tsx`     | 通用 UI 封装组件（Panel/VBox/HBox/Btn/Text） |
| `src/mixin/mainEuw.ts`      | UE 主窗口集成                                |
| `src/common/persistence/`   | 基于 zod 的类型化持久化 store（详见下文）    |

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
- 协议和权限逻辑来自 `@universe-agent/acp-client-puerts` 的 `AcpUiController`。
- Tab 生命周期由 `main.ts` 管理，编辑器停止时关闭 Tab 并触发控制器清理。

**持久化模块（`src/common/persistence/`）：**

基于 zod 的类型化 store 工厂。schema 既是类型来源，也是运行时校验器。

| 文件          | 说明                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| `index.ts`    | 公共 API：`defineStore`、`flushAllPersistence`、`setPersistenceRoot`                |
| `store.ts`    | `PersistenceStore<T>`：懒加载、防抖写、订阅、损坏回退、备份                        |
| `fileIO.ts`   | 包装 `UE.ProcessIOHelper` 异步 API 为 Promise；`IFileIO` 接口便于测试 mock          |
| `paths.ts`    | 解析持久化根目录：`%APPDATA%/<ProjectName>/EditorPersistence`                       |
| `registry.ts` | 进程级注册表，`flushAllPersistence` 退出前刷盘所有 dirty store                      |

**使用示例：**

```ts
import { z } from 'zod';
import { defineStore } from 'editor';

const settings = defineStore('settings', z.object({
  theme: z.enum(['light', 'dark']).default('dark'),
  recentFiles: z.array(z.string()).default([]),
}));

await settings.ready();
settings.update(s => { s.theme = 'light'; });
const off = settings.onChange(state => console.log(state));
await settings.flush(); // 关键数据建议手动 flush
```

**关键注意：**

- schema 必须能从空对象/`undefined` 解析出完整默认值（用 `z.object({...}).default({})` 或每字段 `.default()`）
- `defineStore` 立即触发懒加载；同步 `get/set/update` 前先 `await store.ready()`
- 写入策略：默认 200ms 防抖合并；UE 进程退出前 `OnPreExit` 自动 `flushAllPersistence()`，强杀进程会丢最近 200ms 修改
- 损坏（JSON parse / schema 校验失败）→ 备份原文件为 `<name>.corrupt-<ts>.json` 并回退默认值
- 不使用 Node.js `fs`，统一走 `UE.ProcessIOHelper`，避免依赖 PuerTS 缺失的 Node 模块
