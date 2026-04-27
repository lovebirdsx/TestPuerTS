#pragma once

#include "CoreMinimal.h"
#include "Commandlets/Commandlet.h"
#include "PuertsGenTypingCommandlet.generated.h"

UCLASS()
class UPuertsGenTypingCommandlet : public UCommandlet
{
	GENERATED_BODY()

public:
	UPuertsGenTypingCommandlet();
	virtual int32 Main(const FString& Params) override;
};
