#include "ReactUMGStarter.h"
#include "Editor.h"
#include "EditorUtilitySubsystem.h"
#include "LevelEditor.h"
#include "EditorCommonModule.h"
#include "Components/Widget.h"
#include "EditorUtilityWidgetBlueprint.h"
#include "Widgets/Docking/SDockTab.h"
#include "Engine/World.h"

FName UReactUMGStarter::Start(UEditorUtilityWidgetBlueprint *EditorUtilityWidgetBlueprint)
{
	const FLevelEditorModule& LevelEditorModule = FModuleManager::GetModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
	const TSharedPtr<FTabManager> LevelEditorTabManager = LevelEditorModule.GetLevelEditorTabManager();
	{
		// Tab已经存在了,就不需要重新生成
		const auto DockTab = LevelEditorTabManager->FindExistingLiveTab(TabName);
		if (DockTab.IsValid())
		{
			UE_LOG(LogEditorCommon, Display, TEXT("UReactUMGStarter tab for %s already exist"), *EditorUtilityWidgetBlueprint->GetName());
			return TabName;
		}
	}

	// 显示标签
	UEditorUtilitySubsystem* EditorUtilitySubsystem = GEditor->GetEditorSubsystem<UEditorUtilitySubsystem>();
	const auto Widget = EditorUtilitySubsystem->SpawnAndRegisterTabAndGetID(EditorUtilityWidgetBlueprint, TabName);
	if (Widget == nullptr)
	{
		UE_LOG(LogEditorCommon, Error, TEXT("UReactUMGStarter spawn tab for %s failed"), *EditorUtilitySubsystem->GetName());
		return TabName;
	}

	return TabName;
}

void UReactUMGStarter::SetContent(UWidget* Content)
{
	const FLevelEditorModule& LevelEditorModule = FModuleManager::GetModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
	const TSharedPtr<FTabManager> LevelEditorTabManager = LevelEditorModule.GetLevelEditorTabManager();
	const auto DockTab = LevelEditorTabManager->FindExistingLiveTab(TabName);
	if (!DockTab.IsValid())
	{
		UE_LOG(LogEditorCommon, Error, TEXT("UReactUMGStarter get DockTab for %s failed"), *TabName.ToString());
		return;
	}

	DockTab->SetContent(Content->TakeWidget());
}

UWorld* UReactUMGStarter::GetWorld() const
{
	// UObject::GetWorld() 对普通 UObject 返回 nullptr
	// 编辑器环境下从 GEditor 获取可用的 PIE 或编辑器 World
	if (GEditor)
	{
		if (UWorld* PIEWorld = GEditor->GetPIEWorldContext() ? GEditor->GetPIEWorldContext()->World() : nullptr)
		{
			return PIEWorld;
		}
		return GEditor->GetEditorWorldContext().World();
	}
	return UObject::GetWorld();
}

FName UReactUMGStarter::StartWithName(FName InTabName, const FText& InTabLabel)
{
	TabName = InTabName;

	const FLevelEditorModule& LevelEditorModule = FModuleManager::GetModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
	const TSharedPtr<FTabManager> TabManager = LevelEditorModule.GetLevelEditorTabManager();

	// Tab 已存在则直接返回
	if (TabManager->FindExistingLiveTab(TabName).IsValid())
	{
		return TabName;
	}

	// 尚未注册则先注册
	if (!TabManager->HasTabSpawner(TabName))
	{
		FText CapturedLabel = InTabLabel;
		TabManager->RegisterTabSpawner(TabName, FOnSpawnTab::CreateLambda(
			[CapturedLabel](const FSpawnTabArgs&) -> TSharedRef<SDockTab>
			{
				return SNew(SDockTab)
					.TabRole(ETabRole::NomadTab)
					.Label(CapturedLabel);
			}))
			.SetDisplayName(InTabLabel);
	}

	TabManager->TryInvokeTab(TabName);
	return TabName;
}
