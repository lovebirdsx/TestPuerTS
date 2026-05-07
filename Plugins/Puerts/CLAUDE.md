## CLAUDE.md

PuerTS 核心运行时插件（第三方，一般不修改）。为 UE 提供 TypeScript/JavaScript 执行环境。

**模块（6 个）：**

| 模块                   | 类型    | 说明                                   |
| ---------------------- | ------- | -------------------------------------- |
| WasmCore               | Runtime | WASM 执行（Wasm3 解释器）              |
| JsEnv                  | Runtime | JS 环境核心：绑定、数据转换、模块加载  |
| DeclarationGenerator   | Editor  | 生成 TypeScript d.ts 声明文件          |
| ParamDefaultValueMetas | Program | C# 参数默认值元数据工具                |
| Puerts                 | Runtime | 运行时模块入口                         |
| PuertsEditor           | Editor  | 编辑器集成（Blueprint 资产、文件监视） |

**关键概念：**

* 支持 V8、Node.js 16、QuickJS 三种 JS 引擎（当前使用 V8 9.4.146.24，Win64 编辑器走 DLL）
* `Content/JavaScript/puerts/` 包含核心运行时 JS 模块（polyfill、事件、日志、模块系统、热重载）
* `Typing/` 目录存放手写 d.ts 类型定义
* JsEnv.Build.cs（749 行）包含复杂的多平台构建配置
* `npx gulp ue:gen_typing` 通过 DeclarationGenerator 生成项目 d.ts

**注意：** 此插件为上游依赖，修改前需充分评估影响。

**本仓库改动：**

* `Source/JsEnv/JsEnv.Build.cs`：把 `UseNodejs` 默认值从 `true` 改为 `false`，让 JsEnv 走 V8 分支（`UseV8Version = V9_4_146_24`，Win64 编辑器走 DLL：`v8.dll/v8_libplatform.dll/v8_libbase.dll/zlib.dll`）。Win64 prebuilt 库放在 `ThirdParty/v8_9.4.146.24/{Inc,Lib/Win64DLL}`，源自 Tencent/puerts release `Unreal_v1.0.9` 的 `puerts_v8_94.tgz`。其它平台（Android/Mac/iOS/Linux）的 V8 库当前未铺设，如需打包对应平台请补齐 ThirdParty 资源。
* `Content/JavaScript/puerts/log.js`：移除了 `console.log/info/warn/error` 中 `if (console_org) console_org.xxx(...)` 的旁路双写。原实现会同时把日志通过 Node 原生 `console_org`（直写 stdout fd）和 `sendRequestSync` → `UE_LOG` 输出，两路在 Windows 管道上并发 `WriteFile` 不互斥，导致 `ue:test:watch` 的 stdout 字节级交错。改后 PuerTS 的 `console.*` 仅走 `sendRequestSync` → `FDefaultLogger`（GLog 受锁保护）。配合 `packages/editor-common/src/logging/installConsoleOverride()` 在每个 PuerTS 入口覆盖 `globalThis.console`，第三方库的 `console.*` 也会被重定向到 `UJsLogHelper`。
