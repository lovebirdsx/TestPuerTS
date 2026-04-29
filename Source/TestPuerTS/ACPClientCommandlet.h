#pragma once

#include "CoreMinimal.h"
#include "Commandlets/Commandlet.h"
#include "ACPClientCommandlet.generated.h"

UCLASS()
class UACPClientCommandlet : public UCommandlet
{
	GENERATED_BODY()

public:
	UACPClientCommandlet();
	virtual int32 Main(const FString& Params) override;
};
