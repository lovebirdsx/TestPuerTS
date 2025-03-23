// Fill out your copyright notice in the Description page of Project Settings.


#include "TsEditorLibrary.h"
#include "TsEditorModule.h"

UTsEditor* UTsEditorLibrary::GetTsEditor()
{	
	FTsEditorModule& TsEditorModule = FModuleManager::LoadModuleChecked<FTsEditorModule>("TsEditor");
	return TsEditorModule.GetTsEditor();
}
