#pragma once

#include "CoreMinimal.h"
#include "Containers/Ticker.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "ProcessIOHelper.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnAsyncFileComplete);

// 异步文件操作的结果对象
// 操作完成后通过 OnComplete delegate 通知，结果通过属性读取
UCLASS()
class EDITORCOMMON_API UAsyncFileResult : public UObject
{
	GENERATED_BODY()

public:
	// 完成通知（无参，避免 PuerTS 的 delegate 参数限制）
	UPROPERTY(BlueprintAssignable, Category = "AsyncFile")
	FOnAsyncFileComplete OnComplete;

	// 操作是否成功
	UPROPERTY(BlueprintReadOnly, Category = "AsyncFile")
	bool bSuccess = false;

	// 读取结果（仅 ReadTextFile 使用）
	UPROPERTY(BlueprintReadOnly, Category = "AsyncFile")
	FString Content;

	// 是否已完成
	UPROPERTY(BlueprintReadOnly, Category = "AsyncFile")
	bool bDone = false;

private:
	friend class UProcessIOHelper;

	// 线程安全的完成标记
	TAtomic<bool> bCompleted{false};
	FTSTicker::FDelegateHandle TickerHandle;

	// 启动 ticker 轮询完成状态
	void StartPolling();
};

UCLASS()
class EDITORCOMMON_API UProcessIOHelper : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	// 检查 stdin 是否有可用输入（非阻塞）
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static bool HasStdinInput();

	// 从 stdin 读取一行（非阻塞，无完整行时返回空字符串）
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static FString ReadStdinLine();

	// 写入 stdout（原始输出，不添加换行）
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static void WriteStdout(const FString& Text);

	// 写入 stderr（原始输出，不添加换行）
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static void WriteStderr(const FString& Text);

	// 异步读取文件内容（UTF-8），完成后通过 OnComplete 通知，结果在 Content 属性
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static UAsyncFileResult* ReadTextFile(const FString& FilePath);

	// 异步检查文件是否存在，完成后通过 OnComplete 通知，结果在 bSuccess 属性
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static UAsyncFileResult* FileExists(const FString& FilePath);

	// 异步写入文件内容（UTF-8，自动创建目录），完成后通过 OnComplete 通知，结果在 bSuccess 属性
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static UAsyncFileResult* WriteTextFile(const FString& FilePath, const FString& Content);

	// 异步创建目录树，完成后通过 OnComplete 通知，结果在 bSuccess 属性
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static UAsyncFileResult* MakeDirTree(const FString& Path);

	// stdin 是否是 TTY
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static bool IsStdinTTY();

	// 获取环境变量
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static FString GetEnvVar(const FString& Name);

private:
	// stdin 行缓冲区
	static TArray<uint8> StdinBuffer;
};
