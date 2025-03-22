#include "EditorHelper.h"
#include "AssetManagerEditorModule.h"
#include "SGameplayTagPicker.h"

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
