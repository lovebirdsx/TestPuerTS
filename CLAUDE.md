# TestPuerTS

集成 PuerTS（Unreal Engine 的 TypeScript/JavaScript 运行时）的 UE 5.5 项目。

## 项目结构

```
Source/                       # C++ 模块
  TestPuerTS/                 # 运行时模块（依赖 JsEnv）
    PuertsTestCommandlet.*    # Commandlet：通过 FJsEnv 运行 JS 测试，无需编辑器
  TestPuerTSEditor/           # 编辑器模块
  TsEditor/                   # 编辑器模块
Plugins/                      # UE 插件（包含 Puerts）
Content/JavaScript/           # JS 输出（编译后的 TS 输出到此处）
  editor/                     # 编辑器端 TS 输出
  tests/                      # 测试包 TS 输出
Typing/                       # PuerTS 生成的 d.ts 文件（ue.d.ts、ue_bp.d.ts）
packages/                     # npm 工作区（yarn/npm）
  editor/                     # 编辑器端 TypeScript（编译输出到 Content/JavaScript/editor）
  tests/                      # Commandlet 测试脚本（编译输出到 Content/JavaScript/tests）
  tool/                       # 构建工具（gulp 任务、工具函数）
    src/
      gulpfile.ts             # 顶层 gulp 任务组合
      config.ts               # CLI 参数 + 路径配置
      common/exec.ts          # exec 辅助函数，带输出格式化
      common/util.ts          # 文件工具函数、颜色辅助函数
      packages/               # 按包定义的 gulp 任务
        ue.ts                 # ue:build, ue:test, ue:gen_typing, ue:build:watch, ue:build:clean
        editor.ts             # editor:build, editor:watch, editor:test, editor:lint
        tests.ts              # tests:build, tests:watch（成功后自动触发 ue:test）
        tool.ts               # tool:build, tool:watch, tool:test, tool:lint
```

## 常用命令

```bash
npm run dev           # = gulp dev：构建 C++ 和测试，然后启动所有监听器
npm run watch         # = gulp watch：启动所有监听器，不进行初始构建

# 单独的 gulp 任务
npx gulp ue:build          # 通过 Build.bat 编译 C++
npx gulp ue:test           # 通过 PuertsTestCommandlet 运行 JS 测试（无需编辑器）
npx gulp ue:gen_typing     # 通过 Puerts.Gen 控制台命令生成 d.ts 类型定义
npx gulp ue:build:watch    # 监听 C++ 源文件；.h 文件变更还会触发 gen_typing
npx gulp ue:build:clean    # 清理 C++ 构建产物

npx gulp tests:build       # 编译测试包 TS
npx gulp tests:watch       # 监听测试 TS；编译成功后自动运行 ue:test

npx gulp editor:build      # 编译编辑器包 TS
npx gulp editor:watch      # 监听编辑器 TS
npx gulp editor:test       # 运行编辑器 mocha 测试
npx gulp editor:lint       # 检查编辑器包代码规范

npx gulp tool:build        # 编译工具包（postinstall 时也会运行）
npx gulp tool:tsc-check    # 类型检查 + 循环依赖检查（madge）
```

## 架构说明

- **Gulp 任务编排**：任务按包定义在 `packages/tool/src/packages/` 中，在 `gulpfile.ts` 中组合。
- **`dev` 任务**解决冷启动问题：并行运行 `ue:build` + `tests:build`，然后启动 `watch`。
- **`ue:build:watch`** 使用两个独立的 `gulp.watch` 实例：头文件（`.h`）触发构建 + gen_typing；其他文件（`.cpp`、`.cs`、`.uplugin`、`.uproject`）仅触发构建。排除 `**/Intermediate/**` 和 `**/Binaries/**`。
- **`tests:watch`** 启动 `tsc -w`，解析 stdout 中的 "Found 0 errors"，然后自动触发 `ue:test`。
- **引擎路径解析**：`ue.ts` 中的 `getEngineRoot()` 读取 `.uproject` 的 EngineAssociation，从 `LauncherInstalled.dat` 查找安装路径。
- **PuertsTestCommandlet**：创建 `FJsEnv`，运行 JS 模块（默认 `tests/main`），通过 tick 等待异步完成。

## 代码风格

- TypeScript 配合 ESLint 9 + Prettier
- TypeScript 使用 Tab 缩进
- 可以使用中文注释
- gulp 任务日志使用 `gulplog` 的 `info()`，配合 `green()`/`blue()`/`red()` 颜色辅助函数

## 注意

- 回答请使用中文
