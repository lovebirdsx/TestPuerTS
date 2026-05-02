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

* 支持 V8、Node.js 16、QuickJS 三种 JS 引擎（当前使用 Node.js）
* `Content/JavaScript/puerts/` 包含核心运行时 JS 模块（polyfill、事件、日志、模块系统、热重载）
* `Typing/` 目录存放手写 d.ts 类型定义
* JsEnv.Build.cs（749 行）包含复杂的多平台构建配置
* `npx gulp ue:gen_typing` 通过 DeclarationGenerator 生成项目 d.ts

**注意：** 此插件为上游依赖，修改前需充分评估影响。
