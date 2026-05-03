#pragma once

#include "CoreMinimal.h"
#include "Widgets/Docking/SDockTab.h"
#include "ReactUMGStarter.generated.h"

UCLASS(BlueprintType)
class EDITORCOMMON_API UReactUMGStarter : public UObject
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "EditorCommon")
	FName Start(class UEditorUtilityWidgetBlueprint *EditorUtilityWidgetBlueprint);

	UFUNCTION(BlueprintCallable, Category = "EditorCommon")
	FName StartWithName(FName InTabName, const FText& InTabLabel);

	UFUNCTION(BlueprintCallable, Category = "EditorCommon")
	void SetContent(class UWidget* Content);

	UFUNCTION(BlueprintCallable, Category = "EditorCommon")
	virtual UWorld* GetWorld() const override;

	DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnTabClosedEvent);

	UPROPERTY(BlueprintAssignable, Category = "EditorCommon")
	FOnTabClosedEvent OnTabClosed;

private:
	FName TabName;
	void OnDockTabClosed(TSharedRef<SDockTab> Tab);
};
