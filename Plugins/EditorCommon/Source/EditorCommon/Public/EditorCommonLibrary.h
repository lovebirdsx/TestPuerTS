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
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static UEditorEvent* GetEditorEvent();

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static FName ShowEditorWidget(UEditorUtilityWidgetBlueprint* EditorUtilityWidgetBlueprint);

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static void CloseEditorWidget(const FName &TabName);

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "EditorCommon")
	static bool IsMainFrameCreationFinished();
};
