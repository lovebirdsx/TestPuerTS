## CLAUDE.md

编辑器通用库插件，提供 IPC 传输、子进程管理、JS 执行辅助和编辑器事件。

**模块：** EditorCommon（Editor 模块，依赖 JsEnv/Puerts）

**关键文件：**

| 文件                           | 说明                                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| `Public/IPCTransport.h`        | UIPCTransport：Windows 命名管道传输层，FTSTicker 驱动轮询                  |
| `Public/ProcessIOHelper.h`     | UProcessIOHelper：stdin/stdout/stderr 读写、文件 I/O、环境变量             |
| `Public/JsRunHelper.h`         | UJsRunHelper：供 JS 调用 MarkDone(exitCode) 通知异步完成                   |
| `Public/JsRunnerCommandlet.h`  | UJsRunnerCommandlet：通过 FJsEnv 运行 JS 模块（-run=JsRunner -module=xxx） |
| `Public/ChildProcess.h`        | UChildProcess：子进程创建与管理                                            |
| `Public/ReactUMGStarter.h`     | UReactUMGStarter：ReactUMG 初始化入口                                      |
| `Public/EditorEvent.h`         | UEditorEvent：编辑器生命周期事件（OnPreExit 等）                           |
| `Public/EditorCommonLibrary.h` | Blueprint 可调用的编辑器工具函数                                           |

**注意事项：**

* FTickableGameObject::Tick() 在 Commandlet 环境中不会调用，需使用 FTSTicker
* DYNAMIC_MULTICAST_DELEGATE 回调不支持 TArray<uint8> 参数，需用无参 delegate + 轮询替代
