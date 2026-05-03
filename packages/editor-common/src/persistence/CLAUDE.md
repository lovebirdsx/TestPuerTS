**持久化模块**

基于 zod 的类型化 store 工厂。schema 既是类型来源，也是运行时校验器。

| 文件                          | 说明                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| `src/persistence/index.ts`    | 公共 API：`defineStore`、`flushAllPersistence`、`setPersistenceRoot`       |
| `src/persistence/store.ts`    | `PersistenceStore<T>`：懒加载、防抖写、订阅、损坏回退、备份                |
| `src/persistence/fileIO.ts`   | 包装 `UE.ProcessIOHelper` 异步 API 为 Promise；`IFileIO` 接口便于测试 mock |
| `src/persistence/paths.ts`    | 解析持久化根目录：`%APPDATA%/<ProjectName>/EditorPersistence`              |
| `src/persistence/registry.ts` | 进程级注册表，`flushAllPersistence` 退出前刷盘所有 dirty store             |

**使用示例：**

```ts
import { z } from 'zod';
import { defineStore } from '@universe-agent/editor-common';

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
