## CLAUDE.md

编辑器辅助插件，提供自定义输入处理器、命令注册和编辑器设置管理。

**模块：** EditorHelper（Editor 模块，无外部插件依赖）

**关键文件：**

| 文件                                  | 说明                                                                 |
| ------------------------------------- | -------------------------------------------------------------------- |
| `Public/EditorHelperModule.h`         | FEditorHelperModule：模块入口，注册 Settings/Commands/InputProcessor |
| `Public/EditorHelper.h`               | 编辑器辅助功能主接口                                                 |
| `Public/EditorHelperCommands.h`       | 编辑器命令注册与管理                                                 |
| `Public/EditorHelperInputProcessor.h` | 自定义输入处理器（IInputProcessor）                                  |
| `Public/EditorHelperSettings.h`       | 编辑器设置项定义（UDeveloperSettings 子类）                          |
