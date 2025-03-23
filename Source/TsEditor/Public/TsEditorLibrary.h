// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "TsEditorLibrary.generated.h"

class UTsEditor;

/**
 * 
 */
UCLASS()
class TSEDITOR_API UTsEditorLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "TsEditor")
	static UTsEditor* GetTsEditor();
};
