#pragma once

#include "CoreMinimal.h"
#include "ReactUMGStarter.generated.h"

UCLASS(BlueprintType)
class EDITORCOMMON_API UReactUMGStarter : public UObject
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "EditorCommon")
	FName Start(class UEditorUtilityWidgetBlueprint *EditorUtilityWidgetBlueprint);

	UFUNCTION(BlueprintCallable, Category = "EditorCommon")
	void SetContent(class UWidget* Content);

	UFUNCTION(BlueprintCallable, Category = "EditorCommon")
	virtual UWorld* GetWorld() const override;

private:
	FName TabName;
};
