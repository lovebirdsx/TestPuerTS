# CLAUDE.md

## 概述

`@universe/lib` 是 Universe Editor 的共享基础库，从 VS Code 架构中提取而来。提供事件系统、生命周期管理、IPC 通信、依赖注入（DI）、日志等基础设施。

## 常用命令

```bash
npm run build          # tsup 打包，输出单文件到 dist/
npm run dev            # vitest --watch 开发模式
npm test               # vitest run 运行所有测试
npm run typecheck      # tsc --noEmit 类型检查
npm run lint           # eslint 检查
npm run lint:fix       # eslint 自动修复
npm run check          # typecheck + lint + test
```

## 架构

### 模块导出结构

- `src/index.ts` — 根入口，只导出稳定的 common API
- `src/common.ts` — 显式 common 入口
- `src/node.ts` — Node 入口，导出 common + node IPC
- `src/platform.ts` — 平台服务入口
- `src/base/` — 基础工具层：
  - `index.common.ts` — 跨平台公共导出（uri、event、async、lifecycle、ipc 等）
  - `index.browser.ts` — 浏览器环境（= common）
  - `index.node.ts` — Node 环境（= common + node IPC 实现）
- `src/platform/` — 平台服务层（DI、日志、IPC 服务接口）

### 依赖注入系统（`platform/instantiation/`）

采用 VS Code 风格的 DI：
- `createDecorator<T>(id)` 创建服务标识符，同时作为参数装饰器注入依赖
- `InstantiationService` 管理服务容器，支持延迟实例化（通过 `SyncDescriptor` 的 `supportsDelayedInstantiation`）
- `ServiceCollection` 存储服务注册，`Graph` 处理依赖拓扑排序

### IPC 通信（`base/parts/ipc/`）

- `common/ipc.ts` — Channel/Client/Server 协议抽象（`IChannel`、`IServerChannel`、`ChannelClient`、`ChannelServer`）
- `common/ipc.net.ts` — 基于消息协议的网络传输层（`Protocol`、`BufferedEmitter`）
- `node/ipc.net.ts` — Node.js Socket/NamedPipe 实现（`NodeSocket`、`Server`、`connect`）

### 事件系统（`base/common/event.ts`）

`Emitter<T>` 是核心事件发射器，`Event` 命名空间提供丰富的组合操作（map、filter、debounce、buffer、chain 等）。所有事件监听通过 `IDisposable` 管理生命周期。

## 代码风格

- TypeScript，Tab 缩进，strict 模式
- 可以使用中文注释
- 测试文件放在对应模块的 `test/` 子目录，命名 `*.test.ts`

## 其它

- 回答请使用中文
- 完成功能后请使用 `npm run check` 来校验
