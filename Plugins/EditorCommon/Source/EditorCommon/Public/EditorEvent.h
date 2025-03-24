#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "EditorEvent.generated.h"

class FEditorCommonModule;

/**
 * 提供一系列编辑器相关的事件给蓝图使用
 */
UCLASS(BlueprintType)
class EDITORCOMMON_API UEditorEvent : public UObject
{
	GENERATED_BODY()
public:
	DECLARE_DYNAMIC_MULTICAST_DELEGATE(FEvent0);

	UPROPERTY(EditAnywhere, BlueprintAssignable, Category="EditorCommon", meta=( IsBindableEvent="True" ))
	FEvent0 OnOnMainFrameCreationFinished;
	
	UPROPERTY(EditAnywhere, BlueprintAssignable, Category="EditorCommon", meta=( IsBindableEvent="True" ))
	FEvent0 OnPreExit;	

private:
	friend class FEditorCommonModule;

	void Initialize();
	void Deinitialize();
};
