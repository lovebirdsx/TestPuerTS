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

	// 获取测试过滤器（通过 -test=X 命令行参数设置）
	UFUNCTION(BlueprintCallable, Category = "PuertsTest")
	static FString GetTestFilter();

	// 启动外部进程，返回进程 ID（失败返回 -1）
	UFUNCTION(BlueprintCallable, Category = "PuertsTest")
	static int32 SpawnProcess(const FString& Executable, const FString& Args, const FString& WorkingDir);

	// 检查进程是否仍在运行
	UFUNCTION(BlueprintCallable, Category = "PuertsTest")
	static bool IsProcessRunning(int32 ProcessId);

	// 终止进程
	UFUNCTION(BlueprintCallable, Category = "PuertsTest")
	static void KillProcess(int32 ProcessId);

	// 获取 UE 项目根目录绝对路径
	UFUNCTION(BlueprintCallable, Category = "PuertsTest")
	static FString GetProjectDir();

	// 重置状态，每次运行测试前调用
	static void Reset();

	static bool bTestDone;
	static int32 TestExitCode;
	static FString TestFilter;

private:
	static TMap<int32, FProcHandle> ManagedProcesses;
	static int32 NextProcessId;
};
