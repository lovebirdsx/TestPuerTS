## CLAUDE.md

仓库级 Gulp 构建编排工具。`build/typecheck/lint/lint:fix/watch/clean` 走 workspace 级实现（一次 tsc -b、一次 eslint . 等），新增包仅需在注册表追加一项 + 在根 `tsconfig.workspace.json` 加一行 references，不需要修改 `gulpfile.ts`。

**构建输出：** `out/`

**目录定位：** 位于 `tools/build`，属于开发工具 workspace，不属于 `packages/` 下的运行时/业务包。本身是 composite project，**但不进入 gulp 任务体系**：tool 自身的 build/lint/typecheck/watch/test/clean 都通过 `tools/build/package.json` 的 npm scripts 管理，与 gulp 完全解耦——避免"gulp 编译/lint 自己"的循环依赖。`postinstall` 与 `npm run dev` 在调用 gulp 前先 `npm --workspace @test-puerts/build-tools run build` 把 tool 准备好。

**关键文件：**

* `src/gulpfile.ts`：顶层任务组合（build/typecheck/lint/lint:fix/watch/check/dev/clean），全部 alias 到 workspace:* / ue:* 任务
* `src/packages/registry.ts`：**包注册表**：`WORKSPACE_PACKAGES` 数组（每项含 `name`/`dir`/`srcGlob`/`outDir`/可选 `enableMadge`/`hasWatch`）+ `allSrcGlobs()`/`allTsconfigGlobs()` 聚合函数。tool 自身 **不在** 此注册表中
* `src/packages/workspace.ts`：workspace 级任务（`workspace:build`/`:lint`/`:lint:fix`/`:watch`/`:typecheck`/`:clean`）+ 注册表驱动的按包薄包装（含 `<pkg>:clean`）
* `src/packages/ue.ts`：UE 专属任务（`ue:build`、`ue:gen_typing`、`ue:test`、`ue:build:watch`、`ue:test:watch`、`ue:build:clean` 等）。`ue:test*` 与 `ue:acp-client` 通过命名 flag 把额外参数透传给 PuerTS：测试任务用 `--filter`/`-t`/`--test-name-pattern`；ACP 用 `--acp-args="..."`。gulpfile 把它们以 ` -- <tokens>` 形式追加到 UE 命令行，C++ commandlet 按 `" -- "` 拆给 `UE.JsRunHelper.GetCommandArgs()`
* `src/config.ts`：CLI 参数 + 路径配置
* `src/cmdArgs.ts`：命令行参数解析
* `src/common/exec.ts`：exec 辅助函数，带输出格式化
* `src/common/util.ts`：文件工具（`cleanDirAsync`/`rmFileAsync` 等）、颜色辅助函数
* `src/common/taskCache.ts`：构建缓存机制（`--force`/`-f` 跳过；`bypass()` 选项允许任务在某些条件下强制执行）
* `src/common/passthroughArgs.ts`：抽取 gulp 命令行上的命名 flag（`--filter`/`-t`/`--acp-args` 等），并提供 `quoteForCmd` 拼接到 shell 命令

**workspace 抽象的工作机制：**

* TS 编译：所有 `packages/*` 的 tsconfig 都 `composite: true`（`tests` 是非 composite 叶子消费者），仓库根 `tsconfig.workspace.json` 用 references 把它们组成 solution（**不含 tools/build**）。`workspace:build` 跑 `tsc -b tsconfig.workspace.json`，TypeScript 自己按拓扑顺序增量构建
* ESLint：根 `eslint.config.mjs` 已配齐 ignore 列表（含 `Plugins/**`、`Source/**`、`Saved/**` 等 UE 工程目录），`workspace:lint` 跑 `eslint .` 一次扫完整库（含 tools/build 源码）
* 按包薄包装：`<pkg>:lint` / `<pkg>:lint:fix` 仍跑 `eslint src`（per-pkg 缓存粒度，方便单包开发）；`<pkg>:build` / `<pkg>:typecheck` alias 到 `workspace:build`（composite 图无法只构造单包）；`<pkg>:madge` 在 `enableMadge: true` 的包上生成；`<pkg>:watch` 在 `hasWatch: true` 的包上生成（独立 `tsc -w`）；`<pkg>:clean` 删 `outDir` + `tsconfig.tsbuildinfo`，并失效 `.gulp-cache/workspace-build.json` 与 `<pkg>-lint.json`，避免下次 build 误命中缓存
* 顶层 `clean`：`gulp.parallel('workspace:clean', 'cache:clear') → ue:build:clean`。`workspace:clean` 并行清所有包 `<pkg>:clean`；`ue:build:clean` 串行最后（C++ 重编译耗时长）。tool 自身的 `clean` 由 root `npm run clean` 在 gulp clean 后串接 `npm --workspace ... run clean`

**新增包的步骤（gulpfile 零改动）：**

1. 在仓库根 `tsconfig.workspace.json` 的 `references` 加一行 `{ "path": "./packages/<new>" }`
2. 在 `src/packages/registry.ts` 的 `WORKSPACE_PACKAGES` 数组追加一项（**含 `outDir` 字段**，相对项目根，如 `Content/JavaScript/<new>`）
3. 该包的 `tsconfig.json` 设 `composite: true`、`declaration: true`、`tsBuildInfoFile`，并把上游依赖写进 `references`

**任务编排规则：**

* workspace 级任务在 `workspace.ts` 中定义；按包薄包装也在 `workspace.ts` 中由 `registerPackage()` 自动注册
* `gulpfile.ts` 顶层任务（`build`/`typecheck`/`lint`/`lint:fix`/`watch`/`clean` 等）只串 workspace:* 与少量 ue:* 任务，不再硬编码包名
* 日志使用 `gulplog` 的 `info()`，配合 `green()`/`blue()`/`red()` 颜色函数
* 缓存机制：基于输入文件哈希，`--force`/`-f` 强制跳过；workspace 级缓存粒度较粗，但 `tsc -b` 自身的 `.tsbuildinfo` 提供更细的增量；`<pkg>:clean` 同时失效相关缓存条目

**tool 自身的开发（不走 gulp）：**

```bash
npm --workspace @test-puerts/build-tools run build      # tsc -b
npm --workspace @test-puerts/build-tools run watch      # tsc -b -w
npm --workspace @test-puerts/build-tools run lint
npm --workspace @test-puerts/build-tools run typecheck
npm --workspace @test-puerts/build-tools run test
npm --workspace @test-puerts/build-tools run test:watch
npm --workspace @test-puerts/build-tools run clean      # 删 out/ + tsconfig.tsbuildinfo
npm --workspace @test-puerts/build-tools run check      # lint + typecheck + test
```

**常用命令（业务包 / UE 编排）：**

```bash
npx gulp check               # 串行：build → typecheck → lint → ue:test（不含 tool 自检）
npx gulp typecheck           # = workspace:typecheck（一次 tsc -b + 各包 madge fan-out）
npx gulp lint                # = workspace:lint（一次根级 eslint .）
npx gulp lint:fix            # = workspace:lint:fix
npx gulp watch               # 并行 workspace:watch（根级 tsc -b -w）+ ue:build:watch
npx gulp test:watch          # 并行 workspace:watch + ue:test:watch（commandlet 热重启）
npx gulp clean               # workspace:clean + cache:clear（并行）→ ue:build:clean
npx gulp <pkg>:lint          # 单包 lint（eslint src，per-pkg 缓存）
npx gulp <pkg>:typecheck     # 等价 workspace:build [+ <pkg>:madge]
npx gulp <pkg>:clean         # 删该包 outDir + tsbuildinfo + 失效相关缓存
```
