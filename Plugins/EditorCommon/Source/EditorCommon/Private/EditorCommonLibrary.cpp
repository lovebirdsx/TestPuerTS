// Fill out your copyright notice in the Description page of Project Settings.


#include "EditorCommonLibrary.h"

#include "EditorCommonModule.h"
#include "EditorUtilitySubsystem.h"
#include "LevelEditor.h"
#include "Interfaces/IMainFrameModule.h"

UEditorEvent* UEditorCommonLibrary::GetEditorEvent()
{
	FEditorCommonModule& EditorCommonModule = FModuleManager::LoadModuleChecked<FEditorCommonModule>("EditorCommon");
	return EditorCommonModule.GetEditorEvent();
}

FName UEditorCommonLibrary::ShowEditorWidget(UEditorUtilityWidgetBlueprint* EditorUtilityWidgetBlueprint)
{
	if (!EditorUtilityWidgetBlueprint)
	{
		UE_LOG(LogEditorCommon, Error, TEXT("EditorUtilityWidgetBlueprint is null"));
		return NAME_None;
	}	

	const FLevelEditorModule& LevelEditor = FModuleManager::GetModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
	const TSharedPtr<FTabManager> TabManager = LevelEditor.GetLevelEditorTabManager();	

	UEditorUtilitySubsystem* EditorUtilitySubsystem = GEditor->GetEditorSubsystem<UEditorUtilitySubsystem>();
	FName TabName0;
	if (const auto Widget = EditorUtilitySubsystem->SpawnAndRegisterTabAndGetID(EditorUtilityWidgetBlueprint, TabName0); Widget == nullptr)
	{
		UE_LOG(LogEditorCommon, Error, TEXT("Spawn tab for %s failed"), *EditorUtilitySubsystem->GetName());
		return NAME_None;
	}

	return TabName0;
}

void UEditorCommonLibrary::CloseEditorWidget(const FName& TabName)
{
	const FLevelEditorModule& LevelEditor = FModuleManager::GetModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
	const TSharedPtr<FTabManager> TabManager = LevelEditor.GetLevelEditorTabManager();
	if (const TSharedPtr<SDockTab> Tab = TabManager->FindExistingLiveTab(TabName); Tab.IsValid())
	{
		Tab->RequestCloseTab();	
	}	
}

bool UEditorCommonLibrary::IsMainFrameCreationFinished()
{
	if (!FModuleManager::Get().IsModuleLoaded("MainFrame"))
	{
		return false;
	}

	const IMainFrameModule& MainFrameModule = IMainFrameModule::Get();
	return MainFrameModule.IsWindowInitialized();
}
