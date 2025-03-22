#include "TsEditorModule.h"

#include "TsEditor.h"
#include "TsEditorSettings.h"

#define LOCTEXT_NAMESPACE "FTsEditorModule"

DEFINE_LOG_CATEGORY(LogTsEditor);

void FTsEditorModule::StartupModule()
{
    const UTsEditorSettings *Settings = GetDefault<UTsEditorSettings>();
    TsEditor = NewObject<UTsEditor>(GetTransientPackage(), FName("TsEditor"));
    TsEditor->ModuleName = Settings->ModuleName;
    TsEditor->DebugPort = Settings->DebugPort;
    TsEditor->bWaitJSDebug = Settings->bWaitJSDebug;
    TsEditor->Start();
}

void FTsEditorModule::ShutdownModule()
{
    TsEditor->Stop();
}

#undef LOCTEXT_NAMESPACE
    
IMPLEMENT_MODULE(FTsEditorModule, TsEditor)