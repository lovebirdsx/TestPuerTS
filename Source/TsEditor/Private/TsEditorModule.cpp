#include "TsEditorModule.h"

#include "Framework/Commands/UICommandList.h"
#include "Framework/Commands/UIAction.h"
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
	AddRegisteredMenuEntries(TsEditorMenu);
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

bool FTsEditorModule::RegisterMenuEntry(const FTsEditorMenuEntryConfig& Config, FTsEditorMenuExecute Execute, FTsEditorMenuCanExecute CanExecute)
{
	if (Config.Id.IsNone())
	{
		UE_LOG(LogTsEditor, Error, TEXT("Can not register TsEditor menu entry without Id"));
		return false;
	}

	FTsEditorRegisteredMenuEntry Entry;
	Entry.Config = Config;
	if (Entry.Config.Owner.IsNone())
	{
		Entry.Config.Owner = TEXT("TsEditorJS");
	}
	if (Entry.Config.Section.IsNone())
	{
		Entry.Config.Section = TEXT("Dynamic");
	}
	if (Entry.Config.Label.IsEmpty())
	{
		Entry.Config.Label = Entry.Config.Id.ToString();
	}
	Entry.Execute = Execute;
	Entry.CanExecute = CanExecute;

	RegisteredMenuEntries.Add(Entry.Config.Id, Entry);
	RefreshMenus();
	return true;
}

bool FTsEditorModule::UnregisterMenuEntry(FName Id)
{
	const bool bRemoved = RegisteredMenuEntries.Remove(Id) > 0;
	if (bRemoved)
	{
		RefreshMenus();
	}
	return bRemoved;
}

int32 FTsEditorModule::UnregisterMenuEntriesByOwner(FName Owner)
{
	if (Owner.IsNone())
	{
		Owner = TEXT("TsEditorJS");
	}

	int32 RemovedCount = 0;
	for (auto It = RegisteredMenuEntries.CreateIterator(); It; ++It)
	{
		if (It.Value().Config.Owner == Owner)
		{
			It.RemoveCurrent();
			++RemovedCount;
		}
	}

	if (RemovedCount > 0)
	{
		RefreshMenus();
	}
	return RemovedCount;
}

void FTsEditorModule::RefreshMenus()
{
	if (!bCommandsRegistered || !UToolMenus::IsToolMenuUIEnabled())
	{
		return;
	}

	UToolMenus::UnregisterOwner(this);
	RegisterMenus();
	UToolMenus::Get()->RefreshAllWidgets();
}

void FTsEditorModule::ExecuteRegisteredMenuEntry(FName Id)
{
	if (FTsEditorRegisteredMenuEntry* Entry = RegisteredMenuEntries.Find(Id))
	{
		Entry->Execute.ExecuteIfBound(Id);
	}
}

bool FTsEditorModule::CanExecuteRegisteredMenuEntry(FName Id)
{
	if (FTsEditorRegisteredMenuEntry* Entry = RegisteredMenuEntries.Find(Id))
	{
		return !Entry->CanExecute.IsBound() || Entry->CanExecute.Execute(Id);
	}
	return false;
}

void FTsEditorModule::AddRegisteredMenuEntries(UToolMenu* TsEditorMenu)
{
	if (!TsEditorMenu)
	{
		return;
	}

	TArray<FTsEditorRegisteredMenuEntry> Entries;
	RegisteredMenuEntries.GenerateValueArray(Entries);
	Entries.Sort([](const FTsEditorRegisteredMenuEntry& Left, const FTsEditorRegisteredMenuEntry& Right)
	{
		const FString LeftPath = FString::Join(Left.Config.Path, TEXT("/"));
		const FString RightPath = FString::Join(Right.Config.Path, TEXT("/"));
		if (LeftPath != RightPath)
		{
			return LeftPath < RightPath;
		}
		if (Left.Config.SortOrder != Right.Config.SortOrder)
		{
			return Left.Config.SortOrder < Right.Config.SortOrder;
		}
		return Left.Config.Id.LexicalLess(Right.Config.Id);
	});

	TMap<FString, UToolMenu*> CreatedSubMenus;
	for (const FTsEditorRegisteredMenuEntry& Entry : Entries)
	{
		UToolMenu* CurrentMenu = TsEditorMenu;
		FString MenuKey;
		for (const FString& Segment : Entry.Config.Path)
		{
			if (Segment.IsEmpty())
			{
				continue;
			}

			MenuKey = MenuKey.IsEmpty() ? Segment : MenuKey / Segment;
			if (UToolMenu** ExistingMenu = CreatedSubMenus.Find(MenuKey))
			{
				CurrentMenu = *ExistingMenu;
				continue;
			}

			const FName SubMenuName(*MenuKey);
			CurrentMenu = CurrentMenu->AddSubMenu(
				this,
				TEXT("Dynamic"),
				SubMenuName,
				FText::FromString(Segment),
				FText::FromString(Segment));
			CreatedSubMenus.Add(MenuKey, CurrentMenu);
		}

		FToolMenuSection& DynamicSection = CurrentMenu->FindOrAddSection(Entry.Config.Section);
		FToolMenuEntry& MenuEntry = DynamicSection.AddMenuEntry(
			Entry.Config.Id,
			FText::FromString(Entry.Config.Label),
			FText::FromString(Entry.Config.ToolTip),
			FSlateIcon(),
			FUIAction(
				FExecuteAction::CreateRaw(this, &FTsEditorModule::ExecuteRegisteredMenuEntry, Entry.Config.Id),
				FCanExecuteAction::CreateRaw(this, &FTsEditorModule::CanExecuteRegisteredMenuEntry, Entry.Config.Id)));
		MenuEntry.bShouldCloseWindowAfterMenuSelection = Entry.Config.bCloseAfterSelection;
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
