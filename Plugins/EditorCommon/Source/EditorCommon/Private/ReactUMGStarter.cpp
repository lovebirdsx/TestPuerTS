#include "ReactUMGStarter.h"
#include "Editor.h"
#include "EditorUtilitySubsystem.h"
#include "LevelEditor.h"
#include "EditorCommonModule.h"
#include "Components/Widget.h"
#include "EditorUtilityWidgetBlueprint.h"

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
	return UObject::GetWorld();
}
