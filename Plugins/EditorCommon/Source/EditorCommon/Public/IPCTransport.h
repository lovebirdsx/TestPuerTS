#pragma once

#include "CoreMinimal.h"
#include "Containers/Ticker.h"
#include "ArrayBuffer.h"
#include "IPCTransport.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnIPCConnected);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnIPCClosed);
DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnIPCDataAvailable);

UCLASS(BlueprintType)
class EDITORCOMMON_API UIPCTransport : public UObject
{
	GENERATED_BODY()

public:
	UIPCTransport();
	virtual ~UIPCTransport() override;

	// 创建命名管道服务器，等待客户端连接。返回 true 表示成功启动监听，false 表示管道创建失败
	UFUNCTION(BlueprintCallable, Category = "IPC")
	bool Listen(const FString& PipeName);

	// 连接到命名管道服务器
	UFUNCTION(BlueprintCallable, Category = "IPC")
	void Connect(const FString& PipeName);

	// 发送二进制数据（接受 ArrayBuffer，适合 JS 调用）
	UFUNCTION(BlueprintCallable, Category = "IPC")
	void SendBuffer(const FArrayBuffer& Buffer);

	// 读取接收到的数据（返回 ArrayBuffer，无数据时返回空）
	UFUNCTION(BlueprintCallable, Category = "IPC")
	FArrayBuffer ReadBuffer();

	// 是否有待读取的数据
	UFUNCTION(BlueprintCallable, Category = "IPC")
	bool HasPendingData() const { return PendingData.Num() > 0; }

	// 关闭连接
	UFUNCTION(BlueprintCallable, Category = "IPC")
	void Close();

	// 连接是否已建立
	UFUNCTION(BlueprintCallable, Category = "IPC")
	bool IsConnected() const { return bIsConnected; }

	// 有数据到达时触发（通知 JS 来读取）
	UPROPERTY(BlueprintAssignable, Category = "IPC")
	FOnIPCDataAvailable OnDataAvailable;

	// 连接建立回调
	UPROPERTY(BlueprintAssignable, Category = "IPC")
	FOnIPCConnected OnConnected;

	// 连接关闭回调
	UPROPERTY(BlueprintAssignable, Category = "IPC")
	FOnIPCClosed OnClosed;

private:
	bool OnTick(float DeltaTime);
	bool WriteRaw(const uint8* Data, int32 Length);
	void PollRead();
	void CleanupHandle();
	void StartTicker();
	void StopTicker();

	void* PipeHandle;
	void* ConnectOverlapped;
	bool bIsServer;
	bool bIsConnected;
	bool bIsListening;
	TArray<uint8> ReadBuf;
	TArray<uint8> PendingData;
	FTSTicker::FDelegateHandle TickerHandle;
};
