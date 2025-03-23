#include "TsEditorModule.h"

#include "ISettingsModule.h"
#include "TsEditor.h"
#include "TsEditorSettings.h"
#include "Interfaces/IMainFrameModule.h"

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

    if (FModuleManager::Get().IsModuleLoaded("MainFrame"))
    {
        IMainFrameModule& MainFrameModule = IMainFrameModule::Get();
        MainFrameModule.OnMainFrameCreationFinished().AddLambda([this](TSharedPtr<SWindow> Window, bool bValue)
        {
            TsEditor = NewObject<UTsEditor>(GetTransientPackage(), FName("TsEditor"));
            this->SyncSettingsToEditor();
            TsEditor->Start();            
        });
    }
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
