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
  editor-common/              # editor/mcp-server-ue/tests 共享 Unreal 公共模块（IPC + persistence）
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
npm run check                   # 串行：build → typecheck → lint → unittest

# 顶层组合任务（注册表驱动，新增包不需要修改任务定义）
npx gulp build                  # ue:gen_typing → workspace:build（根级一次 tsc -b）
npx gulp typecheck              # workspace:build + 各包 madge fan-out
npx gulp lint                   # 一次根级 eslint .（覆盖所有包）
npx gulp lint:fix               # 一次根级 eslint . --fix
npx gulp watch                  # workspace:watch（根级 tsc -b -w）+ ue:build:watch
npx gulp test:watch             # workspace:watch + ue:test:watch（commandlet 热重启 < 5s）
npx gulp check                  # 等价 npm run check
npx gulp cache:clear            # 清理 .gulp-cache 目录

# 按包薄包装（注册表自动生成；适合只关注一个包的开发）
npx gulp <pkg>:lint             # eslint src，单包缓存
npx gulp <pkg>:lint:fix         # eslint src --fix
npx gulp <pkg>:typecheck        # = workspace:build [+ <pkg>:madge]
npx gulp <pkg>:build            # = workspace:build（composite 图无法只构造单包）
npx gulp <pkg>:watch            # 独立 tsc -w（仅 editor / tool 等开启了 hasWatch 的包）

# UE 专属任务
npx gulp ue:gen_vscode_settings # 通过 UnrealBuildTool 生成 .vscode/c_cpp_properties.json 和 compileCommands_*.json
npx gulp ue:build               # 通过 Build.bat 编译 C++
npx gulp ue:test                # 通过 JsRunnerCommandlet 运行 JS 测试（无需编辑器）
npx gulp ue:test:watch          # 长驻 commandlet：C++ 端轮询 Content/JavaScript 变化，自动重建 JsEnv 重跑测试
npx gulp ue:gen_typing          # 通过 Puerts.Gen 控制台命令生成 d.ts 类型定义
npx gulp ue:build:watch         # 监听 C++ 源文件；.h 文件变更还会触发 gen_typing
npx gulp ue:build:clean         # 清理 C++ 构建产物
npx gulp ue:acp-client          # 启动 ACP 客户端（交互式 REPL）

# 其他
npx gulp tool:test              # vitest 单元测试（tools/build 自身）
npx gulp tool:test:watch        # vitest watch
```

> 新增 workspace 包：仓库根 `tsconfig.workspace.json` 加一行 references + `tools/build/src/packages/registry.ts` 的 `WORKSPACE_PACKAGES` 加一项即可。`gulpfile.ts` 不需修改。

> CLI 透传：`ue:test` / `ue:test:debug` / `ue:test:watch` / `ue:acp-client` 支持把命名 flag 透传给跑在 PuerTS 里的 JS（gulp 5 的 yargs 不识别 POSIX `--`，所以走命名 flag 而非 `--`）。透传非空时会绕过 `withCache`，强制执行。
> - 测试：`--filter <suite-prefix>` / `-t <regex>`（亦支持 `--test-name-pattern`），可组合：`npx gulp ue:test --filter ueBindings -t async`

## 架构说明

- **测试体系**：项目只有两条测试线。
  - `tool:test`（vitest）—— `tools/build` 自身的纯 Node 单元测试。
  - `ue:test`（JsRunnerCommandlet + 自实现 vitest 风 runner）—— 所有需要 PuerTS/UE 引擎的测试（含 UE 绑定、IPC、ReactUMG、persistence 等），代码在 `packages/tests/`。
  - editor 包不再持有任何独立测试入口；所有"在 PuerTS 引擎里测 UE 绑定"的用例统一在 `packages/tests/src/ueBindings/`。
- **Gulp 任务编排**：`tools/build/src/packages/registry.ts` 的 `WORKSPACE_PACKAGES` 是单一数据源；`workspace.ts` 据此自动注册按包薄包装与 workspace 级任务（`workspace:build/lint/lint:fix/typecheck/watch`）。`gulpfile.ts` 顶层任务 alias 到 workspace:* + 少量 ue:* 任务，新增包不需修改任务定义。缓存机制基于输入文件哈希，`--force` 强制跳过。
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
- **MCP 集成（acp-client-ue → agent）**：把 UE 编辑器能力作为 MCP server 暴露给 ACP agent。
  - `packages/mcp-server-ue/` 基于 `@modelcontextprotocol/sdk` 的 `McpServer` 实现，配合 `BridgeTransport` 把命名管道的 ndjson 帧适配为 SDK Transport。
  - `packages/mcp-bridge/` 是 Node.js stdio↔命名管道桥接进程；agent 视角看到一个标准 stdio MCP server，bridge 内部把帧透明中继到调用方进程。
  - `packages/acp-client-ue/src/mcp/` 的 `McpManager` 在 ACP `session/new`/`session/load` 之前为 session 启动管道 server 并组装 mcpServers entry；`AcpClient` facade 自动调用，editor 面板与 CLI 都开箱即用。
  - 项目根 `mcp-servers.json` 配置启用 / 禁用内置 server 与追加外部 MCP server；`--no-mcp` / `--mcp-config <path>` 在 CLI 覆盖。
- **公共模块抽取（editor-common）**：
  - `packages/editor-common/` 承载 editor、mcp-server-ue、tests 共享的 Unreal 相关基础模块。
  - 当前包含 `ipc`（`BridgeLink`、`UeIpcSocket`）和 `persistence`（`defineStore`、`PersistenceStore`、`ueFileIO`）两类能力。  


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
