# TestPuerTS

集成 PuerTS（Unreal Engine 的 TypeScript/JavaScript 运行时）的 UE 5.5 项目。

## 项目结构

```
Source/                       # C++ 模块
  TestPuerTS/                 # 运行时模块（依赖 JsEnv）
  TestPuerTSEditor/           # 编辑器模块
  TsEditor/                   # 编辑器模块
Plugins/                      # UE 插件（包含 Puerts）
  EditorCommon/               # 编辑器通用插件
  EditorHelper/               # 编辑器辅助功能插件
  ReactUMG/                   # React UMG 插件
  Puerts/                     # PuerTS 核心插件
Content/JavaScript/           # JS 输出（编译后的 TS 输出到此处）
  editor/                     # 编辑器端 TS 输出
  tests/                      # 测试包 TS 输出（tsc 编译）
Typing/                       # PuerTS 生成的 d.ts 文件（ue.d.ts、ue_bp.d.ts）
packages/                     # npm 工作区（yarn/npm）
  editor/                     # 编辑器端 TypeScript（编译输出到 Content/JavaScript/editor）
  tests/                      # Commandlet 测试脚本（tsc 编译输出到 Content/JavaScript/tests）
  acp-client-ue/                 # ACP 协议客户端（移植到 PuerTS 环境）
tools/                        # 仓库级开发工具
  build/                      # 构建工具（gulp 任务、工具函数）
```

## 常用命令

```bash
npm ci                          # 安装依赖；postinstall 会编译 tool、构建 UE，并生成 VS Code C++ 配置
npm run dev                     # 监听 tool 源码变更，自动重编译后执行 gulp dev
npx gulp watch                  # 启动所有监听器，不进行初始构建

# 单独的 gulp 任务
npx gulp ue:gen_vscode_settings # 通过 UnrealBuildTool 生成 .vscode/c_cpp_properties.json 和 compileCommands_*.json
npx gulp ue:build               # 通过 Build.bat 编译 C++
npx gulp ue:test                # 通过 JsRunnerCommandlet 运行 JS 测试（无需编辑器）
npx gulp ue:gen_typing          # 通过 Puerts.Gen 控制台命令生成 d.ts 类型定义
npx gulp ue:build:watch         # 监听 C++ 源文件；.h 文件变更还会触发 gen_typing
npx gulp ue:build:clean         # 清理 C++ 构建产物

npx gulp tests:build            # 编译测试包 TS（tsc 编译）
npx gulp tests:watch            # 监听测试 TS；编译成功后自动运行 ue:test
npx gulp tests:typecheck        # 类型检查
npx gulp tests:lint             # 检查代码规范
npx gulp tests:lint:fix         # 自动修复代码规范

npx gulp acp-client:build       # 编译 ACP 客户端 TS（PuerTS 端 + Node.js 桥接）
npx gulp ue:acp-client          # 启动 ACP 客户端（交互式 REPL）

npx gulp mcp-bridge:build       # 编译 MCP stdio↔pipe 桥接（Node CommonJS）
npx gulp mcp-bridge:typecheck   # 类型检查
npx gulp mcp-bridge:lint        # 检查代码规范
npx gulp mcp-bridge:lint:fix    # 自动修复代码规范

npx gulp mcp-server-ue:build    # 编译 PuerTS 内 MCP Server
npx gulp mcp-server-ue:typecheck
npx gulp mcp-server-ue:lint
npx gulp mcp-server-ue:lint:fix

npx gulp editor:build           # 编译编辑器包 TS
npx gulp editor:watch           # 监听编辑器 TS
npx gulp editor:typecheck       # 类型检查 + 循环依赖检查（madge）
npx gulp editor:lint            # 检查编辑器包代码规范
npx gulp editor:lint:fix        # 自动修复编辑器包代码规范

npx gulp tool:build             # 编译工具包（postinstall 时也会运行）
npx gulp tool:typecheck         # 类型检查 + 循环依赖检查（madge）
npx gulp tool:lint              # 检查工具包代码规范
npx gulp tool:lint:fix          # 自动修复工具包代码规范

# 统一组合任务
npx gulp typecheck              # 并行运行所有包的类型检查
npx gulp lint                   # 并行运行所有包的 lint 检查
npx gulp lint:fix               # 并行运行所有包的 lint 自动修复
npx gulp unittest               # 并行运行 tool 单元测试 + ue:test（commandlet 测试）
npx gulp check                  # 串行运行 build → typecheck → lint → unittest
```

## 架构说明

- **测试体系**：项目只有两条测试线。
  - `tool:test`（vitest）—— `tools/build` 自身的纯 Node 单元测试。
  - `ue:test`（JsRunnerCommandlet + 自实现 vitest 风 runner）—— 所有需要 PuerTS/UE 引擎的测试（含 UE 绑定、IPC、ReactUMG、persistence 等），代码在 `packages/tests/`。
  - editor 包不再持有任何独立测试入口；所有"在 PuerTS 引擎里测 UE 绑定"的用例统一在 `packages/tests/src/ueBindings/`。
- **Gulp 任务编排**：任务按包定义在 `tools/build/src/packages/` 中，在 `gulpfile.ts` 中组合。加入了自定义的缓存机制，可以通过 `--no-cache` 强制跳过缓存。
- **IPC/RPC 架构**：PuerTS ↔ Node.js 跨进程通信，通过 Windows 命名管道实现。
  - C++ 层：`UIPCTransport`（`EditorCommon` 插件），使用 `FTSTicker` 轮询管道数据，通过 `FArrayBuffer` 与 JS 交换二进制数据。
  - TS 适配层：`UeIpcSocket` 将 `UIPCTransport` 包装为 universe-lib 的 `ISocket` 接口。
  - 协议层：复用 `universe-lib` 的 `Protocol` → `IPCClient/Server` → `ProxyChannel` 自动编排。
  - Node.js 端：直接使用 `universe-lib` 的 `serve()`/`connect()` 连接命名管道。
- **tests 包构建**：使用 tsc 编译输出多文件 CommonJS，`universe-lib` 通过 `DefaultJSModuleLoader` 的 `ExtraSearchPaths`（指向项目根目录）在运行时解析，`ue`/`puerts` 由 PuerTS 运行时提供。
- **ACP Client 架构**：ACP 协议客户端，在 PuerTS 环境中运行。
  - `@agentclientprotocol/sdk` 是 ESM-only 且依赖 Web Streams，因此自实现了 JSON-RPC 2.0 层（`jsonrpc.ts`）替代 SDK 的 `ClientSideConnection`/`ndJsonStream`。
  - 通过 Node.js 桥接脚本（`bridge.ts`）启动 ACP Server（`@universe-agent/acp`），PuerTS 通过命名管道与桥接通信，桥接在管道和 ACP Server stdio 之间双向中继 ndjson。
  - C++ `ProcessIOHelper` 提供 PuerTS 缺失的 API：stdin 非阻塞读取、stdout/stderr 写入、文件 I/O。
- **MCP 集成（editor → agent）**：editor 把 UE 编辑器能力作为 MCP server 暴露给 ACP agent。
  - `packages/mcp-server-ue/` 基于 `@modelcontextprotocol/sdk` 的 `McpServer` 实现，配合 `BridgeTransport` 把命名管道的 ndjson 帧适配为 SDK Transport。
  - `packages/mcp-bridge/` 是 Node.js stdio↔命名管道桥接进程；agent 视角看到一个标准 stdio MCP server，bridge 内部把帧透明中继到 editor。
  - `packages/editor/src/mcp/` 的 `McpManager` 在 ACP `session/new`/`session/load` 之前为 session 启动管道 server 并组装 mcpServers entry，`AcpClientPanel` 自动调用。
  - 项目根 `mcp-servers.json` 配置启用 / 禁用内置 server 与追加外部 MCP server。


## 代码风格

- TypeScript 配合 ESLint 9 + Prettier
- TypeScript 使用 Tab 缩进
- 可以使用中文注释
- gulp 任务日志使用 `gulplog` 的 `info()`，配合 `green()`/`blue()`/`red()` 颜色辅助函数

## 注意

- 回答请使用中文
- Plugins和packages的每个包都有自己独立的CLAUDE.md，你在完成功能后，若有需要，请务必更新对应的CLAUDE.md，保持文档与代码同步
- 完成feature后，请执行 `npm run check` 来检查

## PuerTS 环境注意事项

- `setTimeout`/`setInterval` 必须显式传入延迟参数（底层 C++ 要求 `int32`），省略会报 "Bad parameters #1, expect a int32"。已在 `puertsPolyfill.ts` 中修复。
- 不支持 ESM 动态 `import()`（报 "Invalid host defined options"），使用顶层静态 `import` 或 `require`。
- `DYNAMIC_MULTICAST_DELEGATE` 回调参数不支持 `TArray<uint8>`，需改用无参 delegate + 轮询（如 `OnDataAvailable` + `ReadBuffer()`）。
- `FTickableGameObject::Tick()` 在 Commandlet 环境中不会被调用，需改用 `FTSTicker` 回调。
