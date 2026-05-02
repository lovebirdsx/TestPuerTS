# TestPuerTS

UE 5.5 + PuerTS 测试工程，包含 C++ 模块、Commandlet 测试、编辑器脚本，以及 PuerTS 与 Node.js 的 IPC/RPC 示例。

## 快速开始

```bash
npm ci
```

安装依赖后，`postinstall` 会自动：

- 编译 `tools/build`
- 构建 `TestPuerTSEditor`
- 生成 VS Code 所需的 Unreal C++ 配置文件

## 常用命令

```bash
npm run dev
npx gulp ue:gen_vscode_settings
npx gulp ue:build
npx gulp ue:gen_typing
npx gulp ue:test
npx gulp tests:rpc
```

## VS Code

如果 `ms-vscode.cpptools` 在 Unreal C++ 文件中无法正确解析或跳转，执行：

```bash
npx gulp ue:gen_vscode_settings
```

该命令会通过 UnrealBuildTool 生成 `.vscode/c_cpp_properties.json` 和 `compileCommands_*.json`。执行后如仍有旧诊断，重载 VS Code 窗口或重置 C/C++ IntelliSense 数据库即可。

  
