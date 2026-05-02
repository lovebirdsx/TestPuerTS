#include "TsEditorModule.h"

#include "Framework/Commands/UICommandList.h"
#include "Framework/Notifications/NotificationManager.h"
#include "ISettingsModule.h"
#include "LevelEditor.h"
#include "ToolMenus.h"
#include "TsEditor.h"
#include "TsEditorCommands.h"
#include "TsEditorSettings.h"
#include "Widgets/Notifications/SNotificationList.h"

#define LOCTEXT_NAMESPACE "FTsEditorModule"

DEFINE_LOG_CATEGORY(LogTsEditor);

void FTsEditorModule::StartupModule()
{
	UTsEditorSettings* Settings = GetMutableDefault<UTsEditorSettings>();
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

	// Commandlet 模式下不启动 JS 虚拟机（如 PuertsGenTyping），避免 editor/main 模块不存在时报错
	if (IsRunningCommandlet())
	{
		return;
	}

	RegisterCommands();

	if (!TsEditor->TryStart())
	{
		ShowTsEditorNotification(
			LOCTEXT("TsEditorStartFailed", "TsEditor failed to start. Fix JavaScript and use Custom > TsEditor > Restart."),
			true);
	}

	// 引擎关闭前，先停止虚拟机，以便处理资源释放相关操作（譬如解绑mixin），避免报错
	FCoreDelegates::OnPreExit.AddLambda([this]()
	{
		TsEditor->Stop();
	});
}

void FTsEditorModule::ShutdownModule()
{
	if (TsEditor)
	{
		TsEditor->Stop();
	}
	UnregisterCommands();

	if (ISettingsModule* SettingsModule = FModuleManager::GetModulePtr<ISettingsModule>("Settings"))
	{
		SettingsModule->UnregisterSettings("Editor", "Plugins", "TsEditor");
	}
}

void FTsEditorModule::SyncSettingsToEditor()
{
	const UTsEditorSettings* Settings = GetDefault<UTsEditorSettings>();
	TsEditor->ModuleName = Settings->ModuleName;
	TsEditor->DebugPort = Settings->DebugPort;
	TsEditor->bWaitJSDebug = Settings->bWaitJSDebug;
}

void FTsEditorModule::RegisterCommands()
{
	if (bCommandsRegistered)
	{
		return;
	}

	FTsEditorCommands::Register();

	PluginCommands = MakeShared<FUICommandList>();
	PluginCommands->MapAction(
		FTsEditorCommands::Get().Restart,
		FExecuteAction::CreateRaw(this, &FTsEditorModule::RestartTsEditor),
		FCanExecuteAction::CreateLambda([this]()
		{
			return TsEditor != nullptr;
		}));

	UToolMenus::RegisterStartupCallback(
		FSimpleMulticastDelegate::FDelegate::CreateRaw(this, &FTsEditorModule::RegisterMenus));

	if (FModuleManager::Get().IsModuleLoaded("LevelEditor"))
	{
		FLevelEditorModule& LevelEditorModule = FModuleManager::LoadModuleChecked<FLevelEditorModule>("LevelEditor");
		LevelEditorModule.GetGlobalLevelEditorActions()->Append(PluginCommands.ToSharedRef());
	}

	bCommandsRegistered = true;
}

void FTsEditorModule::UnregisterCommands()
{
	if (!bCommandsRegistered)
	{
		return;
	}

	if (UToolMenus::IsToolMenuUIEnabled())
	{
		UToolMenus::UnRegisterStartupCallback(this);
		UToolMenus::UnregisterOwner(this);
	}

	if (PluginCommands.IsValid())
	{
		PluginCommands->UnmapAction(FTsEditorCommands::Get().Restart);
		PluginCommands.Reset();
	}

	FTsEditorCommands::Unregister();
	bCommandsRegistered = false;
}

void FTsEditorModule::RegisterMenus()
{
	FToolMenuOwnerScoped OwnerScoped(this);

	UToolMenu* MainMenu = UToolMenus::Get()->ExtendMenu("LevelEditor.MainMenu");
	UToolMenu* CustomMenu = MainMenu->AddSubMenu(
		this,
		"Main",
		"Custom",
		LOCTEXT("CustomMenu", "Custom"),
		LOCTEXT("CustomMenuTooltip", "Custom project tools"));
	UToolMenu* TsEditorMenu = CustomMenu->AddSubMenu(
		this,
		"TsEditor",
		"TsEditor",
		LOCTEXT("TsEditorMenu", "TsEditor"),
		LOCTEXT("TsEditorMenuTooltip", "TsEditor tools"));

	FToolMenuSection& Section = TsEditorMenu->FindOrAddSection("TsEditor", LOCTEXT("TsEditorMenuSection", "TsEditor"));
	Section.AddMenuEntryWithCommandList(FTsEditorCommands::Get().Restart, PluginCommands);
}

void FTsEditorModule::RestartTsEditor()
{
	if (!TsEditor)
	{
		return;
	}

	TsEditor->Stop();
	const bool bStarted = TsEditor->TryStart();
	if (bStarted)
	{
		ShowTsEditorNotification(LOCTEXT("TsEditorRestarted", "TsEditor restarted."), false);
	}
	else
	{
		ShowTsEditorNotification(LOCTEXT("TsEditorRestartFailed", "TsEditor failed to restart. Check LogTsEditor for details."), true);
	}
}

void FTsEditorModule::ShowTsEditorNotification(const FText& Message, bool bIsError) const
{
	FNotificationInfo Info(Message);
	Info.bFireAndForget = true;
	Info.FadeInDuration = 0.0f;
	Info.FadeOutDuration = 5.0f;
	Info.ExpireDuration = bIsError ? 8.0f : 3.0f;

	TSharedPtr<SNotificationItem> Notification = FSlateNotificationManager::Get().AddNotification(Info);
	if (Notification.IsValid())
	{
		Notification->SetCompletionState(bIsError ? SNotificationItem::CS_Fail : SNotificationItem::CS_Success);
	}
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_MODULE(FTsEditorModule, TsEditor)
