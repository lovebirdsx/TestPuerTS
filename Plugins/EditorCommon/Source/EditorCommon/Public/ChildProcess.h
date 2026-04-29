#pragma once

#include "CoreMinimal.h"
#include "Containers/Ticker.h"
#include "ArrayBuffer.h"
#include "ChildProcess.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnChildStdoutData);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnChildStderrData);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnChildExit);

USTRUCT(BlueprintType)
struct FChildProcessOptions
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadWrite, Category = "ChildProcess")
	FString WorkingDir;

	// 合并到当前进程的环境变量
	UPROPERTY(BlueprintReadWrite, Category = "ChildProcess")
	TMap<FString, FString> Environment;

	// 将 stderr 合并到 stdout（单流输出）
	UPROPERTY(BlueprintReadWrite, Category = "ChildProcess")
	bool bMergeStderr = false;

	// 隐藏子进程窗口
	UPROPERTY(BlueprintReadWrite, Category = "ChildProcess")
	bool bHideWindow = true;
};

UCLASS(BlueprintType)
class EDITORCOMMON_API UChildProcess : public UObject
{
	GENERATED_BODY()

public:
	UChildProcess();
	virtual ~UChildProcess() override;

	// 启动子进程，成功返回 true
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	bool Spawn(const FString& Executable, const FString& Args, const FChildProcessOptions& Options);

	// 写入字符串到子进程 stdin（UTF-8 编码）
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	bool WriteStdin(const FString& Text);

	// 写入二进制数据到子进程 stdin
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	bool WriteStdinBuffer(const FArrayBuffer& Buffer);

	// 关闭 stdin 管道（向子进程发送 EOF）
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	void CloseStdin();

	// 读取 stdout 二进制数据（在 OnStdoutDataAvailable 回调中调用）
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	FArrayBuffer ReadStdout();

	// 读取 stderr 二进制数据（在 OnStderrDataAvailable 回调中调用）
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	FArrayBuffer ReadStderr();

	// 读取 stdout 文本（UTF-8）
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	FString ReadStdoutString();

	// 读取 stderr 文本（UTF-8）
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	FString ReadStderrString();

	// 子进程是否仍在运行
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	bool IsRunning() const { return bIsRunning; }

	// 获取退出码（OnExit 触发后有效）
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	int32 GetExitCode() const { return ExitCode; }

	// 获取 OS 进程 ID
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	int32 GetProcessId() const { return ProcessId; }

	// 终止子进程
	UFUNCTION(BlueprintCallable, Category = "ChildProcess")
	void Kill(bool bKillTree = true);

	// stdout 有数据可读时触发
	UPROPERTY(BlueprintAssignable, Category = "ChildProcess")
	FOnChildStdoutData OnStdoutDataAvailable;

	// stderr 有数据可读时触发
	UPROPERTY(BlueprintAssignable, Category = "ChildProcess")
	FOnChildStderrData OnStderrDataAvailable;

	// 子进程退出时触发
	UPROPERTY(BlueprintAssignable, Category = "ChildProcess")
	FOnChildExit OnExit;

private:
	bool OnTick(float DeltaTime);
	void PollPipe(void* PipeHandle, TArray<uint8>& PendingBuffer, bool bIsStderr);
	void Cleanup();
	void StartTicker();
	void StopTicker();

	// Windows HANDLE（存为 void* 避免头文件引入 Windows.h）
	void* ChildProcessHandle;
	void* ChildThreadHandle;

	void* StdinWritePipe;    // 父端写 → 子进程 stdin
	void* StdoutReadPipe;    // 子进程 stdout → 父端读
	void* StderrReadPipe;    // 子进程 stderr → 父端读

	TArray<uint8> StdoutPendingData;
	TArray<uint8> StderrPendingData;
	TArray<uint8> ReadBuf;

	FTSTicker::FDelegateHandle TickerHandle;

	int32 ProcessId;
	int32 ExitCode;
	bool bIsRunning;
	bool bExitFired;
};
