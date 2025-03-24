#include "EditorEvent.h"

#include "Interfaces/IMainFrameModule.h"

void UEditorEvent::Initialize()
{
	if (FModuleManager::Get().IsModuleLoaded("MainFrame"))
	{
		IMainFrameModule& MainFrameModule = IMainFrameModule::Get();
		MainFrameModule.OnMainFrameCreationFinished().AddLambda([this](TSharedPtr<SWindow> Window, bool bValue)
		{
			OnOnMainFrameCreationFinished.Broadcast();
		});
	}

	FCoreDelegates::OnPreExit.AddLambda([this]() {        
		OnPreExit.Broadcast();        
	});
}

void UEditorEvent::Deinitialize()
{
	if (FModuleManager::Get().IsModuleLoaded("MainFrame"))
	{
		IMainFrameModule& MainFrameModule = IMainFrameModule::Get();
		MainFrameModule.OnMainFrameCreationFinished().RemoveAll(this);
	}
	FCoreDelegates::OnPreExit.RemoveAll(this);
}
