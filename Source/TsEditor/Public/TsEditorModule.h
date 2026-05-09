#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"
#include "TsEditorMenuLibrary.h"

DECLARE_LOG_CATEGORY_EXTERN(LogTsEditor, Log, All);

class UTsEditor;

struct FTsEditorRegisteredMenuEntry
{
	FTsEditorMenuEntryConfig Config;
	FTsEditorMenuExecute Execute;
	FTsEditorMenuCanExecute CanExecute;
};

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
    bool RegisterMenuEntry(const FTsEditorMenuEntryConfig& Config, FTsEditorMenuExecute Execute, FTsEditorMenuCanExecute CanExecute);
    bool UnregisterMenuEntry(FName Id);
    int32 UnregisterMenuEntriesByOwner(FName Owner);
    void RefreshMenus();

private:
    UTsEditor *TsEditor;
    TSharedPtr<class FUICommandList> PluginCommands;
    TMap<FName, FTsEditorRegisteredMenuEntry> RegisteredMenuEntries;
    bool bCommandsRegistered = false;

    void SyncSettingsToEditor();
    void RegisterCommands();
    void UnregisterCommands();
    void RegisterMenus();
    void RestartTsEditor();
    void ToggleWaitJSDebug();
    void OpenTsEditorSettings();
    bool IsWaitJSDebugEnabled() const;
    void ExecuteRegisteredMenuEntry(FName Id);
    bool CanExecuteRegisteredMenuEntry(FName Id);
    void AddRegisteredMenuEntries(class UToolMenu* TsEditorMenu);
    void ShowTsEditorNotification(const FText& Message, bool bIsError) const;
};
