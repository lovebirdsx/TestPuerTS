#pragma once

#include "Kismet/BlueprintFunctionLibrary.h"
#include "EditorHelper.generated.h"

class UDataTable;

UCLASS()
class EDITORHELPER_API UEditorHelper : public UBlueprintFunctionLibrary
{
    GENERATED_BODY()

public:
    // 获得当前编辑的且激活（对应的Tab有焦点）的资源
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static UObject *GetActiveEditAsset();

    // 打开资源所在的文件夹（操作系统）
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static bool OpenAssetFolder(UObject *Asset);

    // 关闭当前编辑的且激活的资源窗口
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static bool CloseActiveEditAsset();

    // 显示当前编辑的且激活资源的引用关系
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static bool ShowActiveEditAssetReference();

    // 打开Gameplay Tag Manager
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static bool OpenGameplayTagManager();

    // 在用户配置的 IDE 中打开源码文件（绝对路径），可选定位到指定行
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static bool OpenSourceFileInIDE(const FString& AbsPath, int32 LineNumber = 0);

    // 运行时构造一个 RichTextBlock 用 TextStyleSet（FRichTextStyleRow），含 ACP 代码块语法着色所需的 hljs-* 行
    // 单例：首次调用创建并 AddToRoot 防 GC，后续调用返回同一实例
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static UDataTable* BuildAcpCodeStyleSet();
};
