#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "PuertsTestHelper.generated.h"

UCLASS()
class UPuertsTestHelper : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	// JS 测试完成时调用此方法，Commandlet 的 tick 循环会检测此标志
	UFUNCTION(BlueprintCallable, Category = "PuertsTest")
	static void MarkTestDone(int32 ExitCode = 0);

	// 重置状态，每次运行测试前调用
	static void Reset();

	static bool bTestDone;
	static int32 TestExitCode;
};
