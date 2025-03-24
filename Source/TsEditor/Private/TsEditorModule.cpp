#include "TsEditorModule.h"

#include "ISettingsModule.h"
#include "TsEditor.h"
#include "TsEditorSettings.h"

#define LOCTEXT_NAMESPACE "FTsEditorModule"

DEFINE_LOG_CATEGORY(LogTsEditor);

void FTsEditorModule::StartupModule()
{    
    UTsEditorSettings *Settings = GetMutableDefault<UTsEditorSettings>();
    if (ISettingsModule* SettingsModule = FModuleManager::GetModulePtr<ISettingsModule>("Settings"))
    {
        SettingsModule->RegisterSettings("Editor", "Plugins", "TsEditor",
            NSLOCTEXT("TsEditor", "TsEditorSettingsName", "TsEditor"),
            NSLOCTEXT("TsEditor", "TsEditorSettingsDescription", "Configure TsEditor settings"),
            Settings);
    }

    Settings->OnPropertyChanged.AddLambda([this](const FString& FieldName)
    {
        UE_LOG(LogTsEditor, Display, TEXT("Settings Changed: %s"), *FieldName);
        SyncSettingsToEditor();
    });    

    TsEditor = NewObject<UTsEditor>(GetTransientPackage(), FName("TsEditor"));
    SyncSettingsToEditor();
    TsEditor->Start();

    // 引擎关闭前，先停止虚拟机，以便处理资源释放相关操作（譬如解绑mixin），避免报错
    FCoreDelegates::OnPreExit.AddLambda([this]() {        
        TsEditor->Stop();
    });
}

void FTsEditorModule::ShutdownModule()
{
    TsEditor->Stop();
    
    if (ISettingsModule* SettingsModule = FModuleManager::GetModulePtr<ISettingsModule>("Settings"))
    {
        SettingsModule->UnregisterSettings("Editor", "Plugins", "TsEditor");
    }
}

void FTsEditorModule::SyncSettingsToEditor()
{
    const UTsEditorSettings *Settings = GetDefault<UTsEditorSettings>();
    TsEditor->ModuleName = Settings->ModuleName;
    TsEditor->DebugPort = Settings->DebugPort;
    TsEditor->bWaitJSDebug = Settings->bWaitJSDebug;
}

#undef LOCTEXT_NAMESPACE
    
IMPLEMENT_MODULE(FTsEditorModule, TsEditor)
