#pragma once

#include "CoreMinimal.h"
#include "Commandlets/Commandlet.h"
#include "JsRunnerCommandlet.generated.h"

UCLASS()
class EDITORCOMMON_API UJsRunnerCommandlet : public UCommandlet
{
	GENERATED_BODY()

public:
	UJsRunnerCommandlet();
	virtual int32 Main(const FString& Params) override;
};
