// Fill out your copyright notice in the Description page of Project Settings.


#include "TsEditorSettings.h"

UTsEditorSettings::UTsEditorSettings() : ModuleName(TEXT("editor/main")), DebugPort(8888), bWaitJSDebug(false)
{
}

void UTsEditorSettings::PostEditChangeProperty(struct FPropertyChangedEvent& PropertyChangedEvent)
{
	Super::PostEditChangeProperty(PropertyChangedEvent);

	const FString FieldName = PropertyChangedEvent.GetPropertyName().ToString();
	OnPropertyChanged.Broadcast(FieldName);
}
