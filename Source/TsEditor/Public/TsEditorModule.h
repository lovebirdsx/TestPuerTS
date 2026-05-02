#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

DECLARE_LOG_CATEGORY_EXTERN(LogTsEditor, Log, All);

class UTsEditor;

class FTsEditorModule : public IModuleInterface
{
public:
    explicit FTsEditorModule()
        : TsEditor(nullptr)
    {
    }

    virtual void StartupModule() override;
    virtual void ShutdownModule() override;

    UTsEditor* GetTsEditor() { return TsEditor; }

private:
    UTsEditor *TsEditor;
    TSharedPtr<class FUICommandList> PluginCommands;
    bool bCommandsRegistered = false;

    void SyncSettingsToEditor();
    void RegisterCommands();
    void UnregisterCommands();
    void RegisterMenus();
    void RestartTsEditor();
    void ShowTsEditorNotification(const FText& Message, bool bIsError) const;
};
