#include "EditorHelperModule.h"
#include "ISettingsModule.h"
#include "LevelEditor.h"
#include "EditorHelperSettings.h"
#include "EditorHelperCommands.h"
#include "EditorHelperInputProcessor.h"

#define LOCTEXT_NAMESPACE "EditorHelper"

void FEditorHelperModule::StartupModule()
{
    RegisterSettings();
    RegisterCommands();
    RegisterInputProcessor();
}

void FEditorHelperModule::ShutdownModule()
{
    UnregisterSettings();
    UnregisterCommands();
    UnregisterInputProcessor();
}

void FEditorHelperModule::RegisterSettings()
{
    if (ISettingsModule *SettingsModule = FModuleManager::GetModulePtr<ISettingsModule>("Settings"))
    {
        SettingsModule->RegisterSettings(
            "Editor",
            "Plugins",
            "Editor Helper",
            LOCTEXT("RuntimeSettingsName", "Editor Helper"),
            LOCTEXT("RuntimeSettingsDescription", "Configure the Editor Helper plugin"),
            GetMutableDefault<UEditorHelperSettings>());
    }
}

void FEditorHelperModule::UnregisterSettings()
{
    if (ISettingsModule *SettingsModule = FModuleManager::GetModulePtr<ISettingsModule>("Settings"))
    {
        SettingsModule->UnregisterSettings("Editor", "Plugins", "Editor Helper");
    }
}

void FEditorHelperModule::RegisterCommands()
{
    FEditorHelperCommands::Register();

    PluginCommands = MakeShareable(new FUICommandList);
    PluginCommands->MapAction(
        FEditorHelperCommands::Get().TestAction,
        FExecuteAction::CreateLambda(
            []()
            {
                FMessageDialog::Open(EAppMsgType::Ok, FText::FromString("Test Action"));
            }),
        FCanExecuteAction());

    if (FModuleManager::Get().IsModuleLoaded("LevelEditor"))
    {
        FLevelEditorModule &LevelEditorModule = FModuleManager::LoadModuleChecked<FLevelEditorModule>("LevelEditor");
        LevelEditorModule.GetGlobalLevelEditorActions()->Append(PluginCommands.ToSharedRef());
    }
}

void FEditorHelperModule::UnregisterCommands()
{
    PluginCommands->UnmapAction(FEditorHelperCommands::Get().TestAction);
    FEditorHelperCommands::Unregister();
}

void FEditorHelperModule::RegisterInputProcessor()
{
    InputProcessor = MakeShareable(new FEditorHelperInputProcessor);
    if (FSlateApplication::IsInitialized())
    {
        FSlateApplication::Get().RegisterInputPreProcessor(InputProcessor.ToSharedRef());
    }
}

void FEditorHelperModule::UnregisterInputProcessor()
{
    if (FSlateApplication::IsInitialized() && InputProcessor.IsValid())
    {
        FSlateApplication::Get().UnregisterInputPreProcessor(InputProcessor.ToSharedRef());
    }
}

IMPLEMENT_MODULE(FEditorHelperModule, EditorHelper)

#undef LOCTEXT_NAMESPACE
