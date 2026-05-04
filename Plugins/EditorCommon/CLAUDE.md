## CLAUDE.md

编辑器通用库插件，提供 IPC 传输、子进程管理、JS 执行辅助和编辑器事件。

**模块：** EditorCommon（Editor 模块，依赖 JsEnv/Puerts）

**关键文件：**

| 文件                           | 说明                                                                                                                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Public/IPCTransport.h`        | UIPCTransport：Windows 命名管道传输层，FTSTicker 驱动轮询                                                                                                                                                                                                |
| `Public/ProcessIOHelper.h`     | UProcessIOHelper：stdin/stdout/stderr 读写、文件 I/O、环境变量、`ListFilesRecursive` 同步快照（递归列文件 + mtime）                                                                                                                                      |
| `Public/JsRunHelper.h`         | UJsRunHelper：供 JS 调用 MarkDone(exitCode) 通知异步完成                                                                                                                                                                                                 |
| `Public/JsLogHelper.h`         | UJsLogHelper：JS 端日志统一入口，4 个静态方法 (Log/Info/Warn/Error)，每个接受 (Category, Message) → `UE_LOG(LogJs, ...)`。所有 PuerTS 端日志走此接口，避免 Node `console.log` 直写 stdout 与 GLog 并发交错（详见 `packages/editor-common/src/logging/`） |
| `Public/JsRunnerCommandlet.h`  | UJsRunnerCommandlet：通过 FJsEnv 运行 JS 模块（`-run=JsRunner -module=xxx`），支持 `-watch` 长驻模式（C++ 端轮询 Content/JavaScript 变化自动重建 JsEnv 重跑）                                                                                            |
| `Public/ChildProcess.h`        | UChildProcess：子进程创建与管理                                                                                                                                                                                                                          |
| `Public/ReactUMGStarter.h`     | UReactUMGStarter：ReactUMG 初始化入口                                                                                                                                                                                                                    |
| `Public/EditorEvent.h`         | UEditorEvent：编辑器生命周期事件（OnPreExit 等）                                                                                                                                                                                                         |
| `Public/EditorCommonLibrary.h` | Blueprint 可调用的编辑器工具函数                                                                                                                                                                                                                         |

**注意事项：**

* FTickableGameObject::Tick() 在 Commandlet 环境中不会调用，需使用 FTSTicker
* DYNAMIC_MULTICAST_DELEGATE 回调不支持 TArray<uint8> 参数，需用无参 delegate + 轮询替代
