# @universe/lib

跨项目复用的基础库，提供事件系统、生命周期管理、IPC、DI 等通用能力。

## 入口划分

- `@universe/lib`：稳定的通用层导出，不包含 Node 运行时适配。
- `@universe/lib/common`：显式访问通用层导出。
- `@universe/lib/node`：Node.js IPC 和连接能力，如 `connect()`、`serve()`。
- `@universe/lib/platform`：DI 与平台服务导出。

## 构建与发布

```bash
npm run build
npm run check
npm pack
```

`npm pack` / `npm publish` 会自动执行 `prepack`，确保 `dist/` 已生成。

## 使用示例

```ts
import { Emitter, ProxyChannel } from '@universe/lib';
import { connect } from '@universe/lib/node';
```
