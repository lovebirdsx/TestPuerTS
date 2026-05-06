## CLAUDE.md

仓库级 Gulp 构建编排工具。`build/typecheck/lint/lint:fix/watch` 走 workspace 级实现（一次 tsc -b、一次 eslint .），新增包仅需在注册表追加一项 + 在根 `tsconfig.workspace.json` 加一行 references，不需要修改 `gulpfile.ts`。

**构建输出：** `out/`

**目录定位：** 位于 `tools/build`，属于开发工具 workspace，不属于 `packages/` 下的运行时/业务包。本身也是 composite project，被 `tsconfig.workspace.json` 引用，所以一次根级 `tsc -b` 也会编译它。

**关键文件：**

* `src/gulpfile.ts`：顶层任务组合（build/typecheck/lint/lint:fix/watch/check/dev），全部 alias 到 workspace:* 任务
* `src/packages/registry.ts`：**包注册表**：`WORKSPACE_PACKAGES` 数组 + `allSrcGlobs()`/`allTsconfigGlobs()` 聚合函数
* `src/packages/workspace.ts`：workspace 级任务（`workspace:build`/`:lint`/`:lint:fix`/`:watch`/`:typecheck`）+ 注册表驱动的按包薄包装
* `src/packages/ue.ts`：UE 专属任务（`ue:build`、`ue:gen_typing`、`ue:test`、`ue:build:watch`、`ue:test:watch` 等）。`ue:test*` 与 `ue:acp-client` 通过命名 flag 把额外参数透传给 PuerTS：测试任务用 `--filter`/`-t`/`--test-name-pattern`；ACP 用 `--acp-args="..."`。gulpfile 把它们以 ` -- <tokens>` 形式追加到 UE 命令行，C++ commandlet 按 `" -- "` 拆给 `UE.JsRunHelper.GetCommandArgs()`。
* `src/packages/tool.ts`：仅保留 `tool:clean` / `tool:test` / `tool:test:watch`（vitest）
* `src/config.ts`：CLI 参数 + 路径配置
* `src/cmdArgs.ts`：命令行参数解析
* `src/common/exec.ts`：exec 辅助函数，带输出格式化
* `src/common/util.ts`：文件工具、颜色辅助函数
* `src/common/taskCache.ts`：构建缓存机制（`--force`/`-f` 跳过；`bypass()` 选项允许任务在某些条件下强制执行）
* `src/common/passthroughArgs.ts`：抽取 gulp 命令行上的命名 flag（`--filter`/`-t`/`--acp-args` 等），并提供 `quoteForCmd` 拼接到 shell 命令

**workspace 抽象的工作机制：**

* TS 编译：所有 `packages/*` 与 `tools/build` 的 tsconfig 都已 `composite: true`（`tests` 是非 composite 叶子消费者），仓库根 `tsconfig.workspace.json` 用 references 把它们组成 solution。`workspace:build` 跑 `tsc -b tsconfig.workspace.json`，TypeScript 自己按拓扑顺序增量构建。
* ESLint：根 `eslint.config.mjs` 已配齐 ignore 列表（含 `Plugins/**`、`Source/**`、`Saved/**` 等 UE 工程目录），`workspace:lint` 跑 `eslint .` 一次扫完整库。
* 按包薄包装：`<pkg>:lint` / `<pkg>:lint:fix` 仍跑 `eslint src`（per-pkg 缓存粒度，方便单包开发）；`<pkg>:build` / `<pkg>:typecheck` alias 到 `workspace:build`（composite 图无法只构造单包）；`<pkg>:madge` 在 `enableMadge: true` 的包上生成；`<pkg>:watch` 在 `hasWatch: true` 的包上生成（独立 `tsc -w`）。

**新增包的步骤（gulpfile 零改动）：**

1. 在仓库根 `tsconfig.workspace.json` 的 `references` 加一行 `{ "path": "./packages/<new>" }`
2. 在 `src/packages/registry.ts` 的 `WORKSPACE_PACKAGES` 数组追加一项
3. 该包的 `tsconfig.json` 设 `composite: true`、`declaration: true`、`tsBuildInfoFile`，并把上游依赖写进 `references`

**任务编排规则：**

* workspace 级任务在 `workspace.ts` 中定义；按包薄包装也在 `workspace.ts` 中由 `registerPackage()` 自动注册
* `gulpfile.ts` 顶层任务（`build`/`typecheck`/`lint`/`lint:fix`/`watch` 等）只串 workspace:* 与少量 ue:* 任务，不再硬编码包名
* 日志使用 `gulplog` 的 `info()`，配合 `green()`/`blue()`/`red()` 颜色函数
* 缓存机制：基于输入文件哈希，`--force`/`-f` 强制跳过；workspace 级缓存粒度较粗，但 `tsc -b` 自身的 `.tsbuildinfo` 提供更细的增量

**常用命令：**

```bash
npx gulp check               # 串行：build → typecheck → lint → unittest
npx gulp typecheck           # = workspace:typecheck（一次 tsc -b + 各包 madge fan-out）
npx gulp lint                # = workspace:lint（一次根级 eslint .）
npx gulp lint:fix            # = workspace:lint:fix
npx gulp watch               # 并行 workspace:watch（根级 tsc -b -w）+ ue:build:watch
npx gulp test:watch          # 并行 workspace:watch + ue:test:watch（commandlet 热重启）
npx gulp <pkg>:lint          # 单包 lint（eslint src，per-pkg 缓存）
npx gulp <pkg>:typecheck     # 等价 workspace:build [+ <pkg>:madge]
```
