## CLAUDE.md

仓库级 Gulp 构建编排工具，定义所有包的 build/watch/lint/typecheck/test 任务。

**构建输出：** `out/`

**目录定位：** 位于 `tools/build`，属于开发工具 workspace，不属于 `packages/` 下的运行时/业务包。

**关键文件：**

| 文件                      | 说明                                                 |
| ------------------------- | ---------------------------------------------------- |
| `src/gulpfile.ts`         | 顶层任务组合（build、check、watch、dev 等）          |
| `src/config.ts`           | CLI 参数 + 路径配置                                  |
| `src/cmdArgs.ts`          | 命令行参数解析                                       |
| `src/common/exec.ts`      | exec 辅助函数，带输出格式化                          |
| `src/common/util.ts`      | 文件工具、颜色辅助函数                               |
| `src/common/taskCache.ts` | 构建缓存机制（--no-cache 跳过）                      |
| `src/packages/*.ts`       | 包任务定义文件（如 editor、editor-common、tests 等） |

**任务编排规则：**

* 任务按包定义在 `src/packages/` 中，在 `gulpfile.ts` 中通过 gulp.series/parallel 组合
* 日志使用 `gulplog` 的 `info()`，配合 `green()`/`blue()`/`red()` 颜色函数
* 缓存机制：基于输入文件哈希，`--no-cache` 强制跳过

**常用命令：**

```bash
npx gulp check    # 串行：build → typecheck → lint → unittest
```
