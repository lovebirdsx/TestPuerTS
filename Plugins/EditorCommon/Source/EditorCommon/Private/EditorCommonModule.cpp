#include "EditorCommonModule.h"

#include "EditorEvent.h"

#define LOCTEXT_NAMESPACE "FEditorCommonModule"

DEFINE_LOG_CATEGORY(LogEditorCommon);

void FEditorCommonModule::StartupModule()
{
	EditorEvent = NewObject<UEditorEvent>(GetTransientPackage(), FName("EditorEvent"));
	EditorEvent->Initialize();
}

void FEditorCommonModule::ShutdownModule()
{
	EditorEvent->Deinitialize();
	EditorEvent = nullptr;
}

#undef LOCTEXT_NAMESPACE
	
IMPLEMENT_MODULE(FEditorCommonModule, EditorCommon)
