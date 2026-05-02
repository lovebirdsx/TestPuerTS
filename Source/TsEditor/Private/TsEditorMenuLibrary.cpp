#include "TsEditorMenuLibrary.h"

#include "TsEditorModule.h"

bool UTsEditorMenuLibrary::RegisterMenuEntry(
	const FTsEditorMenuEntryConfig& Config,
	FTsEditorMenuExecute Execute,
	FTsEditorMenuCanExecute CanExecute)
{
	FTsEditorModule& TsEditorModule = FModuleManager::LoadModuleChecked<FTsEditorModule>("TsEditor");
	return TsEditorModule.RegisterMenuEntry(Config, Execute, CanExecute);
}

bool UTsEditorMenuLibrary::UnregisterMenuEntry(FName Id)
{
	FTsEditorModule& TsEditorModule = FModuleManager::LoadModuleChecked<FTsEditorModule>("TsEditor");
	return TsEditorModule.UnregisterMenuEntry(Id);
}

int32 UTsEditorMenuLibrary::UnregisterMenuEntriesByOwner(FName Owner)
{
	FTsEditorModule& TsEditorModule = FModuleManager::LoadModuleChecked<FTsEditorModule>("TsEditor");
	return TsEditorModule.UnregisterMenuEntriesByOwner(Owner);
}

void UTsEditorMenuLibrary::RefreshMenus()
{
	FTsEditorModule& TsEditorModule = FModuleManager::LoadModuleChecked<FTsEditorModule>("TsEditor");
	TsEditorModule.RefreshMenus();
}
