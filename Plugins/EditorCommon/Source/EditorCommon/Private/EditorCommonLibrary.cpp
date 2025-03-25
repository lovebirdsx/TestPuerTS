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

UWorld* UEditorCommonLibrary::GetWorld()
{
	UWorld* World = nullptr;
	if (GEditor) {
		for (const auto ViewportClient : GEditor->GetAllViewportClients()) {
			if (ViewportClient && ViewportClient->IsPerspective()) {
				if (UWorld* ViewportWorld = ViewportClient->GetWorld()) {
					World = ViewportWorld;
					break;
				}
			}
		}
	}

	return World;
}

void UEditorCommonLibrary::TempWorldTest(FWorldCallbackDelegate Callback)
{
	const FName WorldName = MakeUniqueObjectName(nullptr, UWorld::StaticClass(), NAME_None, EUniqueObjectNameOptions::GloballyUnique);
	UWorld* World = UWorld::CreateWorld(EWorldType::EditorPreview, false, WorldName, GetTransientPackage());
	FWorldContext& WorldContext = GEngine->CreateNewWorldContext(EWorldType::EditorPreview);	
	World->AddToRoot();
	WorldContext.SetCurrentWorld(World);
	
	Callback.ExecuteIfBound(World);
	
	World->RemoveFromRoot();
	World->DestroyWorld(false);	
	GEngine->DestroyWorldContext(World);
}
