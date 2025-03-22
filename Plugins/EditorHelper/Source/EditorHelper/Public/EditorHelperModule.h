#pragma once
#include "Modules/ModuleManager.h"

class FEditorHelperModule : public IModuleInterface
{
public:
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;

private:
    void RegisterSettings();
    void UnregisterSettings();

    void RegisterCommands();
    void UnregisterCommands();

    void RegisterInputProcessor();
    void UnregisterInputProcessor();

    TSharedPtr<class FUICommandList> PluginCommands;
    TSharedPtr<class FEditorHelperInputProcessor> InputProcessor;
};
