#pragma once
#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "InputCoreTypes.h"
#include "EditorHelperSettings.generated.h"

UCLASS(config = Editor, defaultconfig, meta = (DisplayName = "Editor Helper"))
class UEditorHelperSettings : public UObject
{
    GENERATED_BODY()

public:
    UPROPERTY(config, EditAnywhere, Category = "General")
    bool bExampleBoolSetting = false;
};