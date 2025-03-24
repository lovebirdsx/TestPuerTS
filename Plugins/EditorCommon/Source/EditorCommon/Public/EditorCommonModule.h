#pragma once

#include "Modules/ModuleManager.h"

DECLARE_LOG_CATEGORY_EXTERN(LogEditorCommon, Log, All);

class UEditorEvent;

class FEditorCommonModule : public IModuleInterface
{
public:
	explicit FEditorCommonModule()
		: EditorEvent(nullptr)
	{
	}

	virtual void StartupModule() override;
	virtual void ShutdownModule() override;

	UEditorEvent* GetEditorEvent() { return EditorEvent; }

private:
	UEditorEvent* EditorEvent;
};
