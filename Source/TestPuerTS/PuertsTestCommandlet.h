#pragma once

#include "CoreMinimal.h"
#include "Commandlets/Commandlet.h"
#include "PuertsTestCommandlet.generated.h"

UCLASS()
class UPuertsTestCommandlet : public UCommandlet
{
	GENERATED_BODY()

public:
	UPuertsTestCommandlet();
	virtual int32 Main(const FString& Params) override;
};
