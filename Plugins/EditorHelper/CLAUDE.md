## CLAUDE.md

编辑器辅助插件，提供自定义输入处理器、命令注册和编辑器设置管理。

**模块：** EditorHelper（Editor 模块，依赖 `SourceCodeAccess` 用于打开外部 IDE）

**关键文件：**

`Public/EditorHelperModule.h`：FEditorHelperModule：模块入口，注册 Settings/Commands/InputProcessor
`Public/EditorHelper.h`：编辑器辅助功能主接口
`Public/EditorHelperCommands.h`：编辑器命令注册与管理
`Public/EditorHelperInputProcessor.h`：定义输入处理器（IInputProcessor）
`Public/EditorHelperSettings.h`：编辑器设置项定义（UDeveloperSettings 子类）

**`UEditorHelper` BlueprintCallable API：**

`GetActiveEditAsset()`：当前激活资源 / 兜底返回 PersistentLevel
`OpenAssetFolder(Asset)`：资源管理器打开包所在目录
`CloseActiveEditAsset()` / `ShowActiveEditAssetReference()`：关闭当前编辑器窗口 / 打开引用查看器
`OpenGameplayTagManager()`：打开 GameplayTag Manager
`OpenSourceFileInIDE(AbsPath, LineNumber=0)`：通过 `FSourceCodeNavigation::OpenSourceFile` 调用户配置的 IDE（VS / Rider / VSCode）打开源码文件，行号 ≤0 视作 1。供 ACP 面板 `PathChip` 点击跳转使用
`BuildAcpCodeStyleSet()`：返回单例 `UDataTable<FRichTextStyleRow>`，包含 ACP 代码块语法着色用的 `hljs-keyword/string/number/comment/built_in/type/title/literal/meta/attr/variable/symbol/tag/name/regexp/addition/deletion` 行（VSCode Dark+ 调色板）。首次调用 `NewObject` + `AddToRoot` 防 GC，后续返回缓存。Editor 端 `CodeBlock` 通过此函数把样式表挂到 `RichTextBlock.TextStyleSet`，无需 .uasset 资产。依赖 `UMG` 模块（已加入 `PrivateDependencyModuleNames`）
