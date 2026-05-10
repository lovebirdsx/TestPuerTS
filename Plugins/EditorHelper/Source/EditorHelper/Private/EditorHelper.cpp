#include "EditorHelper.h"
#include "AssetManagerEditorModule.h"
#include "SGameplayTagPicker.h"
#include "SourceCodeNavigation.h"
#include "Engine/DataTable.h"
#include "Components/RichTextBlock.h"
#include "Styling/CoreStyle.h"

UObject *UEditorHelper::GetActiveEditAsset()
{
    if (!GEditor)
    {
        UE_LOG(LogTemp, Warning, TEXT("GEditor is null"));
        return nullptr;
    }

    UAssetEditorSubsystem *AssetEditorSubsystem = GEditor->GetEditorSubsystem<UAssetEditorSubsystem>();
    if (!AssetEditorSubsystem)
    {
        return nullptr;
    }

    TArray<UObject *> EditedAssets = AssetEditorSubsystem->GetAllEditedAssets();
    for (UObject *Asset : EditedAssets)
    {
        IAssetEditorInstance *Editor = AssetEditorSubsystem->FindEditorForAsset(Asset, false);
        if (!Editor)
            continue;

        TSharedPtr<class FTabManager> TabManager = Editor->GetAssociatedTabManager();
        if (!TabManager.IsValid())
            continue;

        TSharedPtr<SDockTab> Tab = TabManager->GetOwnerTab();
        if (!Tab.IsValid())
            continue;

        TSharedPtr<SWindow> Window = Tab->GetParentWindow();
        if (!Window.IsValid())
            continue;

        if (Tab->IsForeground() && Window->IsActive())
        {
            return Asset;
        }
    }

    // 如果找不到当前编辑的资源，则返回当前打开的地图
    if (UWorld *EditorWorld = GEditor->GetEditorWorldContext().World())
    {
        return EditorWorld->PersistentLevel;
    }    

    return nullptr;
}

bool UEditorHelper::OpenAssetFolder(UObject* Asset)
{
    if (!Asset)
    {
        return false;
    }

    // 获取资源所在的包
    const UPackage* Package = Asset->GetOutermost();
    if (!Package)
    {
        UE_LOG(LogTemp, Warning, TEXT("Failed to get package for asset %s"), *Asset->GetName());
        return false;
    }

    // 获取包的文件名
    FString PackageFilename;
    if (!FPackageName::TryConvertLongPackageNameToFilename(Package->GetName(), PackageFilename, FPackageName::GetAssetPackageExtension()))
    {
        UE_LOG(LogTemp, Warning, TEXT("Failed to convert package name %s to filename"), *Package->GetName());
        return false;
    }

    // 获取文件夹路径
    FString FolderPath = FPaths::GetPath(PackageFilename);
    if (FolderPath.IsEmpty())
    {
        UE_LOG(LogTemp, Warning, TEXT("Failed to get folder path for %s"), *PackageFilename);
        return false;
    }

    // 确保路径存在
    if (!FPaths::DirectoryExists(FolderPath))
    {
        UE_LOG(LogTemp, Warning, TEXT("Folder path does not exist: %s"), *FolderPath);
        return false;
    }

    // 打开文件夹
    const FString OsPath = IFileManager::Get().ConvertToAbsolutePathForExternalAppForRead(*FolderPath);
    FPlatformProcess::ExploreFolder(*OsPath);    
    return true;
}

bool UEditorHelper::CloseActiveEditAsset()
{
    if (!GEditor)
    {
        UE_LOG(LogTemp, Warning, TEXT("GEditor is null"));
        return false;
    }

    UAssetEditorSubsystem *AssetEditorSubsystem = GEditor->GetEditorSubsystem<UAssetEditorSubsystem>();
    if (!AssetEditorSubsystem)
    {
        return false;
    }

    TArray<UObject *> EditedAssets = AssetEditorSubsystem->GetAllEditedAssets();
    for (UObject *Asset : EditedAssets)
    {
        IAssetEditorInstance *Editor = AssetEditorSubsystem->FindEditorForAsset(Asset, false);
        if (!Editor)
            continue;

        TSharedPtr<class FTabManager> TabManager = Editor->GetAssociatedTabManager();
        if (!TabManager.IsValid())
            continue;

        TSharedPtr<SDockTab> Tab = TabManager->GetOwnerTab();
        if (!Tab.IsValid())
            continue;

        TSharedPtr<SWindow> Window = Tab->GetParentWindow();
        if (!Window.IsValid())
            continue;

        if (Tab->IsForeground() && Window->IsActive())
        {
            Editor->CloseWindow(EAssetEditorCloseReason::AssetEditorHostClosed);
            return true;
        }
    }

    return false;
}

bool UEditorHelper::ShowActiveEditAssetReference()
{
    UObject *FocusedAsset = GetActiveEditAsset();
    if (!FocusedAsset)
    {
        return false;
    }

    const UPackage *Package = FocusedAsset->GetOutermost();
    if (!Package)
    {
        return false;
    }

    IAssetManagerEditorModule &AssetManagerEditorModule = IAssetManagerEditorModule::Get();
    AssetManagerEditorModule.OpenReferenceViewerUI({FAssetIdentifier(Package->GetFName())});

    return true;
}

bool UEditorHelper::OpenGameplayTagManager()
{
    FGameplayTagManagerWindowArgs Args;
    Args.bRestrictedTags = false;
    UE::GameplayTags::Editor::OpenGameplayTagManager(Args);
    return true;
}

bool UEditorHelper::OpenSourceFileInIDE(const FString& AbsPath, int32 LineNumber)
{
    if (AbsPath.IsEmpty())
    {
        UE_LOG(LogTemp, Warning, TEXT("OpenSourceFileInIDE: empty path"));
        return false;
    }

    if (!FPaths::FileExists(AbsPath))
    {
        UE_LOG(LogTemp, Warning, TEXT("OpenSourceFileInIDE: file not found: %s"), *AbsPath);
        return false;
    }

    const int32 Line = LineNumber > 0 ? LineNumber : 1;
    const bool bOpened = FSourceCodeNavigation::OpenSourceFile(AbsPath, Line, 1);
    if (!bOpened)
    {
        UE_LOG(LogTemp, Warning, TEXT("OpenSourceFileInIDE: FSourceCodeNavigation::OpenSourceFile failed for %s"), *AbsPath);
    }
    return bOpened;
}

namespace AcpCodeStyle
{
    // VSCode Dark+ 调色板，对齐 highlight.js 的 hljs-* class 名
    static FRichTextStyleRow MakeRow(const FTextBlockStyle& Base, const FLinearColor& Color)
    {
        FRichTextStyleRow Row;
        Row.TextStyle = Base;
        Row.TextStyle.ColorAndOpacity = FSlateColor(Color);
        return Row;
    }

    static UDataTable* GCachedTable = nullptr;
}

UDataTable* UEditorHelper::BuildAcpCodeStyleSet()
{
    using namespace AcpCodeStyle;
    if (GCachedTable && IsValid(GCachedTable))
    {
        return GCachedTable;
    }

    UDataTable* Table = NewObject<UDataTable>(GetTransientPackage(), UDataTable::StaticClass(), TEXT("AcpCodeStyles"), RF_Standalone | RF_Transient);
    if (!Table)
    {
        UE_LOG(LogTemp, Warning, TEXT("BuildAcpCodeStyleSet: NewObject failed"));
        return nullptr;
    }
    Table->RowStruct = FRichTextStyleRow::StaticStruct();
    Table->AddToRoot();

    const FTextBlockStyle Base = FCoreStyle::Get().GetWidgetStyle<FTextBlockStyle>("NormalText");

    auto Add = [&](const TCHAR* Name, const FLinearColor& Color)
    {
        FRichTextStyleRow Row = MakeRow(Base, Color);
        Table->AddRow(FName(Name), Row);
    };

    Add(TEXT("hljs-keyword"),    FLinearColor(0.337f, 0.612f, 0.839f, 1.f));  // #569CD6
    Add(TEXT("hljs-built_in"),   FLinearColor(0.306f, 0.788f, 0.690f, 1.f));  // #4EC9B0
    Add(TEXT("hljs-type"),       FLinearColor(0.306f, 0.788f, 0.690f, 1.f));  // #4EC9B0
    Add(TEXT("hljs-class"),      FLinearColor(0.306f, 0.788f, 0.690f, 1.f));  // #4EC9B0
    Add(TEXT("hljs-title"),      FLinearColor(0.863f, 0.863f, 0.667f, 1.f));  // #DCDCAA function names
    Add(TEXT("hljs-string"),     FLinearColor(0.808f, 0.569f, 0.471f, 1.f));  // #CE9178
    Add(TEXT("hljs-number"),     FLinearColor(0.710f, 0.808f, 0.659f, 1.f));  // #B5CEA8
    Add(TEXT("hljs-literal"),    FLinearColor(0.337f, 0.612f, 0.839f, 1.f));  // #569CD6
    Add(TEXT("hljs-comment"),    FLinearColor(0.416f, 0.600f, 0.333f, 1.f));  // #6A9955
    Add(TEXT("hljs-meta"),       FLinearColor(0.776f, 0.525f, 0.753f, 1.f));  // #C586C0
    Add(TEXT("hljs-attr"),       FLinearColor(0.612f, 0.863f, 0.996f, 1.f));  // #9CDCFE
    Add(TEXT("hljs-variable"),   FLinearColor(0.612f, 0.863f, 0.996f, 1.f));  // #9CDCFE
    Add(TEXT("hljs-symbol"),     FLinearColor(0.612f, 0.863f, 0.996f, 1.f));
    Add(TEXT("hljs-tag"),        FLinearColor(0.337f, 0.612f, 0.839f, 1.f));
    Add(TEXT("hljs-name"),       FLinearColor(0.337f, 0.612f, 0.839f, 1.f));
    Add(TEXT("hljs-regexp"),     FLinearColor(0.820f, 0.412f, 0.412f, 1.f));  // #D16969
    Add(TEXT("hljs-addition"),   FLinearColor(0.416f, 0.600f, 0.333f, 1.f));  // 同 comment 绿
    Add(TEXT("hljs-deletion"),   FLinearColor(0.957f, 0.278f, 0.278f, 1.f));  // #F44747

    GCachedTable = Table;
    return Table;
}
