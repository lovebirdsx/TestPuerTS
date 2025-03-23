// Fill out your copyright notice in the Description page of Project Settings.


#include "TsEditorLibrary.h"

#include "EditorUtilitySubsystem.h"
#include "LevelEditor.h"
#include "TsEditorModule.h"
#include "Widgets/Docking/SDockTab.h"

UTsEditor* UTsEditorLibrary::GetTsEditor()
{	
	FTsEditorModule& TsEditorModule = FModuleManager::LoadModuleChecked<FTsEditorModule>("TsEditor");
	return TsEditorModule.GetTsEditor();
}

FName UTsEditorLibrary::ShowEditorWidget(UEditorUtilityWidgetBlueprint* EditorUtilityWidgetBlueprint)
{
	if (!EditorUtilityWidgetBlueprint)
	{
		UE_LOG(LogTsEditor, Error, TEXT("EditorUtilityWidgetBlueprint is null"));
		return NAME_None;
	}	

	const FLevelEditorModule& LevelEditor = FModuleManager::GetModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
	const TSharedPtr<FTabManager> TabManager = LevelEditor.GetLevelEditorTabManager();	

	UEditorUtilitySubsystem* EditorUtilitySubsystem = GEditor->GetEditorSubsystem<UEditorUtilitySubsystem>();
	FName TabName0;
	if (const auto Widget = EditorUtilitySubsystem->SpawnAndRegisterTabAndGetID(EditorUtilityWidgetBlueprint, TabName0); Widget == nullptr)
	{
		UE_LOG(LogTsEditor, Error, TEXT("Spawn tab for %s failed"), *EditorUtilitySubsystem->GetName());
		return NAME_None;
	}

	return TabName0;
}

void UTsEditorLibrary::CloseEditorWidget(const FName& TabName)
{
	const FLevelEditorModule& LevelEditor = FModuleManager::GetModuleChecked<FLevelEditorModule>(TEXT("LevelEditor"));
	const TSharedPtr<FTabManager> TabManager = LevelEditor.GetLevelEditorTabManager();
	if (const TSharedPtr<SDockTab> Tab = TabManager->FindExistingLiveTab(TabName); Tab.IsValid())
	{
		Tab->RequestCloseTab();	
	}	
}
