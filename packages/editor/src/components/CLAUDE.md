**通用 UI 组件（`src/components/ui.tsx`）：**

封装 ReactUMG 原始组件，内置 UE5.5 编辑器 Dark 主题默认样式，关键引擎源码参考（位于 `Engine/Source/Runtime/SlateCore/`）：

| 文件                                    | 内容                                                     |
| --------------------------------------- | -------------------------------------------------------- |
| `Private/Styling/StyleColors.cpp`       | Dark 主题 `EStyleColor` HEX 色表                         |
| `Private/Styling/StarshipCoreStyle.cpp` | Slate 按钮/文字/输入框样式定义                           |
| `Private/Styling/UMGCoreStyle.cpp`      | UMG 默认样式（固定色，不跟主题）                         |
| `Public/Styling/CoreStyle.h`            | `ButtonMargins`、`InputFocusThickness` 等常量            |
| `Public/Styling/SlateBrush.h`           | `ESlateBrushDrawType` 枚举（NoDrawType=0、RoundedBox=4） |
