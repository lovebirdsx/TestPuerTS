#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "Styling/SlateBrush.h"
#include "EditorIconHelper.generated.h"

UCLASS()
class EDITORHELPER_API UEditorIconHelper : public UBlueprintFunctionLibrary
{
    GENERATED_BODY()

public:
    // 通过 FAppStyle 名称取出编辑器图标 SlateBrush，例如 "Icons.Plus" / "Icons.Settings"。
    // 取不到时返回默认空 brush（SlateBrush::DrawAs = NoDrawType）。
    UFUNCTION(BlueprintCallable, Category = "EditorHelper")
    static FSlateBrush GetEditorIcon(FName IconName);
};
