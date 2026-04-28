#include "IPCTransport.h"

// Windows API 需要在 AllowWindowsPlatformTypes / HideWindowsPlatformTypes 之间使用
#include "Windows/AllowWindowsPlatformTypes.h"

DEFINE_LOG_CATEGORY_STATIC(LogIPCTransport, Log, All);

static constexpr int32 PIPE_BUFFER_SIZE = 64 * 1024;
static constexpr int32 READ_BUFFER_SIZE = 64 * 1024;

UIPCTransport::UIPCTransport()
	: PipeHandle(INVALID_HANDLE_VALUE)
	, ConnectOverlapped(nullptr)
	, bIsServer(false)
	, bIsConnected(false)
	, bIsListening(false)
{
	ReadBuf.SetNum(READ_BUFFER_SIZE);
}

UIPCTransport::~UIPCTransport()
{
	StopTicker();
	CleanupHandle();
}

void UIPCTransport::StartTicker()
{
	if (!TickerHandle.IsValid())
	{
		TickerHandle = FTSTicker::GetCoreTicker().AddTicker(
			FTickerDelegate::CreateUObject(this, &UIPCTransport::OnTick), 0.01f);
	}
}

void UIPCTransport::StopTicker()
{
	if (TickerHandle.IsValid())
	{
		FTSTicker::GetCoreTicker().RemoveTicker(TickerHandle);
		TickerHandle.Reset();
	}
}

void UIPCTransport::Listen(const FString& PipeName)
{
	if (PipeHandle != INVALID_HANDLE_VALUE)
	{
		UE_LOG(LogIPCTransport, Warning, TEXT("IPCTransport: Already has an active handle, closing first"));
		Close();
	}

	PipeHandle = CreateNamedPipeW(
		*PipeName,
		PIPE_ACCESS_DUPLEX | FILE_FLAG_OVERLAPPED,
		PIPE_TYPE_BYTE | PIPE_READMODE_BYTE | PIPE_WAIT,
		1,
		PIPE_BUFFER_SIZE,
		PIPE_BUFFER_SIZE,
		0,
		nullptr);

	if (PipeHandle == INVALID_HANDLE_VALUE)
	{
		UE_LOG(LogIPCTransport, Error, TEXT("IPCTransport: CreateNamedPipe failed, error=%d"), GetLastError());
		return;
	}

	bIsServer = true;
	bIsListening = true;

	OVERLAPPED* Overlapped = new OVERLAPPED();
	FMemory::Memzero(Overlapped, sizeof(OVERLAPPED));
	Overlapped->hEvent = CreateEventW(nullptr, TRUE, FALSE, nullptr);
	ConnectOverlapped = Overlapped;

	BOOL Result = ConnectNamedPipe(PipeHandle, Overlapped);
	if (!Result)
	{
		DWORD Error = GetLastError();
		if (Error == ERROR_IO_PENDING)
		{
			UE_LOG(LogIPCTransport, Display, TEXT("IPCTransport: Listening on %s, waiting for client..."), *PipeName);
		}
		else if (Error == ERROR_PIPE_CONNECTED)
		{
			bIsConnected = true;
			bIsListening = false;
			UE_LOG(LogIPCTransport, Display, TEXT("IPCTransport: Client already connected on %s"), *PipeName);
			OnConnected.Broadcast();
		}
		else
		{
			UE_LOG(LogIPCTransport, Error, TEXT("IPCTransport: ConnectNamedPipe failed, error=%d"), Error);
			CleanupHandle();
			return;
		}
	}

	StartTicker();
}

void UIPCTransport::Connect(const FString& PipeName)
{
	if (PipeHandle != INVALID_HANDLE_VALUE)
	{
		UE_LOG(LogIPCTransport, Warning, TEXT("IPCTransport: Already has an active handle, closing first"));
		Close();
	}

	PipeHandle = CreateFileW(
		*PipeName,
		GENERIC_READ | GENERIC_WRITE,
		0,
		nullptr,
		OPEN_EXISTING,
		0,
		nullptr);

	if (PipeHandle == INVALID_HANDLE_VALUE)
	{
		DWORD Error = GetLastError();
		UE_LOG(LogIPCTransport, Error, TEXT("IPCTransport: Connect to %s failed, error=%d"), *PipeName, Error);
		return;
	}

	DWORD Mode = PIPE_READMODE_BYTE;
	SetNamedPipeHandleState(PipeHandle, &Mode, nullptr, nullptr);

	bIsServer = false;
	bIsConnected = true;
	UE_LOG(LogIPCTransport, Display, TEXT("IPCTransport: Connected to %s"), *PipeName);

	StartTicker();
	OnConnected.Broadcast();
}

void UIPCTransport::SendBuffer(const FArrayBuffer& Buffer)
{
	if (PipeHandle == INVALID_HANDLE_VALUE || !bIsConnected)
	{
		UE_LOG(LogIPCTransport, Warning, TEXT("IPCTransport: Cannot send, not connected"));
		return;
	}

	WriteRaw(static_cast<const uint8*>(Buffer.Data), static_cast<int32>(Buffer.Length));
}

FArrayBuffer UIPCTransport::ReadBuffer()
{
	FArrayBuffer Result;
	if (PendingData.Num() > 0)
	{
		Result.Data = PendingData.GetData();
		Result.Length = PendingData.Num();
		Result.bCopy = true; // 让 PuerTS 拷贝数据到 JS ArrayBuffer
	}
	else
	{
		Result.Data = nullptr;
		Result.Length = 0;
	}
	return Result;
}

bool UIPCTransport::WriteRaw(const uint8* Data, int32 Length)
{
	DWORD BytesWritten = 0;
	BOOL Result = WriteFile(PipeHandle, Data, Length, &BytesWritten, nullptr);
	if (!Result)
	{
		DWORD Error = GetLastError();
		UE_LOG(LogIPCTransport, Error, TEXT("IPCTransport: WriteFile failed, error=%d"), Error);
		Close();
		return false;
	}
	return true;
}

void UIPCTransport::Close()
{
	if (PipeHandle == INVALID_HANDLE_VALUE)
	{
		return;
	}

	bool WasConnected = bIsConnected;
	StopTicker();
	CleanupHandle();

	if (WasConnected)
	{
		OnClosed.Broadcast();
	}
}

bool UIPCTransport::OnTick(float DeltaTime)
{
	if (bIsListening && ConnectOverlapped)
	{
		OVERLAPPED* Overlapped = static_cast<OVERLAPPED*>(ConnectOverlapped);
		DWORD WaitResult = WaitForSingleObject(Overlapped->hEvent, 0);
		if (WaitResult == WAIT_OBJECT_0)
		{
			bIsConnected = true;
			bIsListening = false;
			UE_LOG(LogIPCTransport, Display, TEXT("IPCTransport: Client connected"));

			CloseHandle(Overlapped->hEvent);
			delete Overlapped;
			ConnectOverlapped = nullptr;

			OnConnected.Broadcast();
		}
	}

	if (bIsConnected)
	{
		PollRead();
	}

	// 继续 tick（返回 true 保持注册）
	return PipeHandle != INVALID_HANDLE_VALUE && (bIsListening || bIsConnected);
}

void UIPCTransport::PollRead()
{
	if (PipeHandle == INVALID_HANDLE_VALUE)
	{
		return;
	}

	DWORD BytesAvailable = 0;
	BOOL PeekResult = PeekNamedPipe(PipeHandle, nullptr, 0, nullptr, &BytesAvailable, nullptr);

	if (!PeekResult)
	{
		DWORD Error = GetLastError();
		if (Error == ERROR_BROKEN_PIPE || Error == ERROR_PIPE_NOT_CONNECTED)
		{
			UE_LOG(LogIPCTransport, Display, TEXT("IPCTransport: Pipe disconnected"));
			Close();
			return;
		}
		return;
	}

	if (BytesAvailable == 0)
	{
		return;
	}

	if (ReadBuf.Num() < static_cast<int32>(BytesAvailable))
	{
		ReadBuf.SetNum(BytesAvailable);
	}

	DWORD BytesRead = 0;
	BOOL ReadResult = ReadFile(PipeHandle, ReadBuf.GetData(), BytesAvailable, &BytesRead, nullptr);

	if (!ReadResult)
	{
		DWORD Error = GetLastError();
		if (Error == ERROR_BROKEN_PIPE || Error == ERROR_PIPE_NOT_CONNECTED)
		{
			UE_LOG(LogIPCTransport, Display, TEXT("IPCTransport: Pipe disconnected during read"));
			Close();
			return;
		}
		UE_LOG(LogIPCTransport, Error, TEXT("IPCTransport: ReadFile failed, error=%d"), Error);
		return;
	}

	if (BytesRead > 0)
	{
		// 清除旧的待读取数据，追加新数据
		PendingData.Empty();
		PendingData.Append(ReadBuf.GetData(), BytesRead);
		// 通知 JS 有新数据（JS 在回调中调用 ReadBuffer() 获取数据）
		OnDataAvailable.Broadcast();
	}
}

void UIPCTransport::CleanupHandle()
{
	bIsConnected = false;
	bIsListening = false;
	PendingData.Empty();

	if (ConnectOverlapped)
	{
		OVERLAPPED* Overlapped = static_cast<OVERLAPPED*>(ConnectOverlapped);
		if (Overlapped->hEvent)
		{
			CloseHandle(Overlapped->hEvent);
		}
		delete Overlapped;
		ConnectOverlapped = nullptr;
	}

	if (PipeHandle != INVALID_HANDLE_VALUE)
	{
		if (bIsServer)
		{
			DisconnectNamedPipe(PipeHandle);
		}
		CloseHandle(PipeHandle);
		PipeHandle = INVALID_HANDLE_VALUE;
	}

	bIsServer = false;
}

#include "Windows/HideWindowsPlatformTypes.h"
