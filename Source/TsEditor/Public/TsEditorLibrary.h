#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "TsEditorLibrary.generated.h"

class UTsEditorSettings;
class UTsEditor;
class UEditorUtilityWidgetBlueprint;

/**
 * TsEditor模块给蓝图提供的静态接口
 */
UCLASS()
class TSEDITOR_API UTsEditorLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "TsEditor")
	static UTsEditor* GetTsEditor();
	
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "TsEditor")
	static UTsEditorSettings* GetTsEditorSettings();
};
