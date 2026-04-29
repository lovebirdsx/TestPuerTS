#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "JsRunHelper.generated.h"

UCLASS()
class EDITORCOMMON_API UJsRunHelper : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	// JS 模块完成时调用此方法，Commandlet 的 tick 循环会检测此标志
	UFUNCTION(BlueprintCallable, Category = "JsRunner")
	static void MarkDone(int32 ExitCode = 0);

	// 获取命令行参数
	UFUNCTION(BlueprintCallable, Category = "JsRunner")
	static FString GetCommandArgs();

	// 启动外部进程，返回进程 ID（失败返回 -1）
	UFUNCTION(BlueprintCallable, Category = "JsRunner")
	static int32 SpawnProcess(const FString& Executable, const FString& Args, const FString& WorkingDir);

	// 检查进程是否仍在运行
	UFUNCTION(BlueprintCallable, Category = "JsRunner")
	static bool IsProcessRunning(int32 ProcessId);

	// 终止进程
	UFUNCTION(BlueprintCallable, Category = "JsRunner")
	static void KillProcess(int32 ProcessId);

	// 获取 UE 项目根目录绝对路径
	UFUNCTION(BlueprintCallable, Category = "JsRunner")
	static FString GetProjectDir();

	// 重置状态，每次运行前调用
	static void Reset();

	static bool bDone;
	static int32 ExitCode;
	static FString CommandArgs;

private:
	static TMap<int32, FProcHandle> ManagedProcesses;
	static int32 NextProcessId;
};
