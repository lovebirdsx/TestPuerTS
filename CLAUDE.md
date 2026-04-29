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
    IPCTransport.*            # UIPCTransport：Windows 命名管道传输层（FTSTicker 驱动）
    ProcessIOHelper.*         # UProcessIOHelper：stdin/stdout/stderr、文件 I/O、环境变量
    JsRunHelper.*             # UJsRunHelper：MarkDone(exitCode) 供 JS 异步通知完成
    JsRunnerCommandlet.*      # UJsRunnerCommandlet：通过 FJsEnv 运行 JS 模块（-run=JsRunner -module=xxx）
Content/JavaScript/           # JS 输出（编译后的 TS 输出到此处）
  editor/                     # 编辑器端 TS 输出
  tests/                      # 测试包 TS 输出（tsc 编译）
Typing/                       # PuerTS 生成的 d.ts 文件（ue.d.ts、ue_bp.d.ts）
packages/                     # npm 工作区（yarn/npm）
  editor/                     # 编辑器端 TypeScript（编译输出到 Content/JavaScript/editor）
  tests/                      # Commandlet 测试脚本（tsc 编译输出到 Content/JavaScript/tests）
    src/ipc/                  # IPC/RPC 相关代码
      ueIpcSocket.ts          # UIPCTransport → ISocket 适配器
      testService.ts          # 测试用 RPC 服务定义（CalculatorService）
      testRpcClient.ts        # PuerTS 作为 Client 的测试用例
      testRpcServer.ts        # PuerTS 作为 Server 的测试用例
    src/standalone/           # 独立 Node.js 进程脚本
      nodeServer.ts           # Node.js RPC Server（配合 testRpcClient）
      nodeClient.ts           # Node.js RPC Client（配合 testRpcServer）
    src/puertsPolyfill.ts     # PuerTS 环境 polyfill（setTimeout 等）
  acp-client/                 # ACP 协议客户端（移植到 PuerTS 环境）
    src/
      index.ts                # 入口：初始化、连接 ACP server、REPL 或单次 prompt
      cli.ts                  # 命令行参数解析（通过 CommandArgs 传入）
      client.ts               # ACPClient + ACPClientHandler：ACP 协议核心
      jsonrpc.ts              # JSON-RPC 2.0 over ndjson（替代 @agentclientprotocol/sdk）
      ueTransport.ts          # UIPCTransport → NdJsonTransport 适配器
      renderer.ts             # 协议消息和会话更新渲染
      repl.ts                 # 交互式 REPL（基于 C++ stdin API）
      format.ts               # 终端颜色格式化（picocolors）
      bridge.ts               # Node.js 桥接脚本：命名管道 ↔ ACP server stdio
  universe-lib/               # IPC 框架库（Protocol、IPCClient/Server、ProxyChannel）
  tool/                       # 构建工具（gulp 任务、工具函数）
    src/
      gulpfile.ts             # 顶层 gulp 任务组合
      config.ts               # CLI 参数 + 路径配置
      common/exec.ts          # exec 辅助函数，带输出格式化
      common/util.ts          # 文件工具函数、颜色辅助函数
      packages/               # 按包定义的 gulp 任务
        ue.ts                 # ue:build, ue:gen_vscode_settings, ue:test, ue:gen_typing, ue:build:watch, ue:build:clean
        editor.ts             # editor:build, editor:watch, editor:test, editor:typecheck, editor:lint, editor:lint:fix
        tests.ts              # tests:build, tests:watch, tests:typecheck, tests:lint, tests:lint:fix, tests:rpc-server-test, tests:rpc-client-test, acp-client:build, ue:acp-client
        tool.ts               # tool:build, tool:watch, tool:test, tool:typecheck, tool:lint, tool:lint:fix
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
npx gulp tests:rpc-server-test  # RPC 测试：Node.js Server + PuerTS Client
npx gulp tests:rpc-client-test  # RPC 测试：PuerTS Server + Node.js Client

npx gulp acp-client:build       # 编译 ACP 客户端 TS（PuerTS 端 + Node.js 桥接）
npx gulp ue:acp-client          # 启动 ACP 客户端（交互式 REPL）

npx gulp editor:build           # 编译编辑器包 TS
npx gulp editor:watch           # 监听编辑器 TS
npx gulp editor:test            # 运行编辑器 vitest 测试
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
npx gulp unittest               # 并行运行 tool + editor 的单元测试
npx gulp check                  # 串行运行 build → typecheck → lint → unittest
```

## 架构说明

- **Gulp 任务编排**：任务按包定义在 `packages/tool/src/packages/` 中，在 `gulpfile.ts` 中组合。
- **根目录启动流程**：`npm run dev` 通过 `nodemon` 监听 `packages/tool/src`，变更后先执行 `gulp tool:build`，再执行 `gulp dev --verbose`；`gulp dev` 本身会先运行 `ue:build`，随后启动 `watch`。
- **`ue:build:watch`** 使用两个独立的 `gulp.watch` 实例：头文件（`.h`）触发构建 + gen_typing；其他文件（`.cpp`、`.cs`、`.uplugin`、`.uproject`）仅触发构建。排除 `**/Intermediate/**` 和 `**/Binaries/**`。
- **`tests:watch`** 启动 `tsc -w`，解析 stdout 中的 "Found 0 errors"，然后自动触发 `ue:test`。
- **引擎路径解析**：`ue.ts` 中的 `getEngineRoot()` 读取 `.uproject` 的 EngineAssociation，从 `LauncherInstalled.dat` 查找安装路径。
- **JsRunnerCommandlet**：创建 `FJsEnv`，运行指定 JS 模块（`-module=` 必填），通过 `FTSTicker` tick 循环等待 `MarkDone()` 异步完成。支持 `-module=X` 和 `-timeout=N` 参数。
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

## 代码风格

- TypeScript 配合 ESLint 9 + Prettier
- TypeScript 使用 Tab 缩进
- 可以使用中文注释
- gulp 任务日志使用 `gulplog` 的 `info()`，配合 `green()`/`blue()`/`red()` 颜色辅助函数

## 注意

- 回答请使用中文
- 完成feature后，请执行 `npm run check` 来检查

## PuerTS 环境注意事项

- `setTimeout`/`setInterval` 必须显式传入延迟参数（底层 C++ 要求 `int32`），省略会报 "Bad parameters #1, expect a int32"。已在 `puertsPolyfill.ts` 中修复。
- 不支持 ESM 动态 `import()`（报 "Invalid host defined options"），使用顶层静态 `import` 或 `require`。
- `DYNAMIC_MULTICAST_DELEGATE` 回调参数不支持 `TArray<uint8>`，需改用无参 delegate + 轮询（如 `OnDataAvailable` + `ReadBuffer()`）。
- `FTickableGameObject::Tick()` 在 Commandlet 环境中不会被调用，需改用 `FTSTicker` 回调。
