#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleManager.h"

DECLARE_LOG_CATEGORY_EXTERN(LogTsEditor, Log, All);

class UTsEditor;

class FTsEditorModule : public IModuleInterface
{
public:
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;

    UTsEditor* GetTsEditor() { return TsEditor; }

private:
    UTsEditor *TsEditor;

    void SyncSettingsToEditor();
};
