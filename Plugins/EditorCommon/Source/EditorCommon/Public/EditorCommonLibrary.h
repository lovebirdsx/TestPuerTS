#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "EditorCommonLibrary.generated.h"

class UEditorEvent;

/**
 * 提供一些列Editor下相关的全局接口给蓝图用
 */
UCLASS(BlueprintType)
class EDITORCOMMON_API UEditorCommonLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()
	
public:
	DECLARE_DYNAMIC_DELEGATE_OneParam(FWorldCallbackDelegate, UWorld*, World);
	
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static UEditorEvent* GetEditorEvent();

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static FName ShowEditorWidget(UEditorUtilityWidgetBlueprint* EditorUtilityWidgetBlueprint);

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static void CloseEditorWidget(const FName &TabName);

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static bool IsMainFrameCreationFinished();
	
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static UWorld* GetWorld();
	
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static void TempWorldTest(FWorldCallbackDelegate Callback); 
};
