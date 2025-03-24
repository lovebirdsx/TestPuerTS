#include "TsEditorLibrary.h"

#include "TsEditorModule.h"
#include "TsEditorSettings.h"
#include "Widgets/Docking/SDockTab.h"

UTsEditor* UTsEditorLibrary::GetTsEditor()
{	
	FTsEditorModule& TsEditorModule = FModuleManager::LoadModuleChecked<FTsEditorModule>("TsEditor");
	return TsEditorModule.GetTsEditor();
}

UTsEditorSettings* UTsEditorLibrary::GetTsEditorSettings()
{
	UTsEditorSettings *Settings = GetMutableDefault<UTsEditorSettings>();
	return Settings;
}
