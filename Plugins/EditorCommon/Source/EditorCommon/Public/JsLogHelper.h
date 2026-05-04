#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "JsLogHelper.generated.h"

EDITORCOMMON_API DECLARE_LOG_CATEGORY_EXTERN(LogJs, Log, All);

// 供 PuerTS / JS 端统一调用的日志接口。
// 所有 JS 输出都走 UE_LOG(LogJs)，被 GLog 内部锁串行化，
// 避免 Node 原生 console.log 直写 stdout 与 UE_LOG 写 stdout 时的字节级交错。
UCLASS()
class EDITORCOMMON_API UJsLogHelper : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, Category = "JsLog")
	static void Log(const FString& Category, const FString& Message);

	UFUNCTION(BlueprintCallable, Category = "JsLog")
	static void Info(const FString& Category, const FString& Message);

	UFUNCTION(BlueprintCallable, Category = "JsLog")
	static void Warn(const FString& Category, const FString& Message);

	UFUNCTION(BlueprintCallable, Category = "JsLog")
	static void Error(const FString& Category, const FString& Message);
};
