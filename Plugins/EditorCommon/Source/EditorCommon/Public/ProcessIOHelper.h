#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "ProcessIOHelper.generated.h"

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

	// 读取文件内容（UTF-8），失败返回空字符串
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static FString ReadTextFile(const FString& FilePath);

	// 检查文件是否存在
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static bool FileExists(const FString& FilePath);

	// 写入文件内容（UTF-8，自动创建目录）
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static bool WriteTextFile(const FString& FilePath, const FString& Content);

	// 创建目录树
	UFUNCTION(BlueprintCallable, Category = "ProcessIO")
	static bool MakeDirTree(const FString& Path);

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
