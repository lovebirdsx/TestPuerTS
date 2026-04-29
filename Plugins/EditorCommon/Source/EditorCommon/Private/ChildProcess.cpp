#include "ChildProcess.h"

#include "Windows/AllowWindowsPlatformTypes.h"

DEFINE_LOG_CATEGORY_STATIC(LogChildProcess, Log, All);

static constexpr int32 ChildProcessReadBufferSize = 64 * 1024;

UChildProcess::UChildProcess()
	: ChildProcessHandle(INVALID_HANDLE_VALUE)
	, ChildThreadHandle(INVALID_HANDLE_VALUE)
	, StdinWritePipe(INVALID_HANDLE_VALUE)
	, StdoutReadPipe(INVALID_HANDLE_VALUE)
	, StderrReadPipe(INVALID_HANDLE_VALUE)
	, ProcessId(0)
	, ExitCode(0)
	, bIsRunning(false)
	, bExitFired(false)
{
	ReadBuf.SetNum(ChildProcessReadBufferSize);
}

UChildProcess::~UChildProcess()
{
	StopTicker();
	if (bIsRunning)
	{
		Kill(true);
	}
	Cleanup();
}

void UChildProcess::StartTicker()
{
	if (!TickerHandle.IsValid())
	{
		TickerHandle = FTSTicker::GetCoreTicker().AddTicker(
			FTickerDelegate::CreateUObject(this, &UChildProcess::OnTick), 0.01f);
	}
}

void UChildProcess::StopTicker()
{
	if (TickerHandle.IsValid())
	{
		FTSTicker::GetCoreTicker().RemoveTicker(TickerHandle);
		TickerHandle.Reset();
	}
}

bool UChildProcess::Spawn(const FString& Executable, const FString& Args, const FChildProcessOptions& Options)
{
	if (bIsRunning)
	{
		UE_LOG(LogChildProcess, Warning, TEXT("ChildProcess: Already running, kill first"));
		return false;
	}

	// 重置状态
	Cleanup();
	bExitFired = false;
	ExitCode = 0;
	ProcessId = 0;

	SECURITY_ATTRIBUTES SA;
	SA.nLength = sizeof(SECURITY_ATTRIBUTES);
	SA.bInheritHandle = TRUE;
	SA.lpSecurityDescriptor = nullptr;

	// 创建 stdin 管道
	HANDLE hStdinRead = INVALID_HANDLE_VALUE;
	HANDLE hStdinWrite = INVALID_HANDLE_VALUE;
	if (!CreatePipe(&hStdinRead, &hStdinWrite, &SA, 0))
	{
		UE_LOG(LogChildProcess, Error, TEXT("ChildProcess: CreatePipe for stdin failed, error=%d"), GetLastError());
		return false;
	}
	SetHandleInformation(hStdinWrite, HANDLE_FLAG_INHERIT, 0);

	// 创建 stdout 管道
	HANDLE hStdoutRead = INVALID_HANDLE_VALUE;
	HANDLE hStdoutWrite = INVALID_HANDLE_VALUE;
	if (!CreatePipe(&hStdoutRead, &hStdoutWrite, &SA, 0))
	{
		UE_LOG(LogChildProcess, Error, TEXT("ChildProcess: CreatePipe for stdout failed, error=%d"), GetLastError());
		CloseHandle(hStdinRead);
		CloseHandle(hStdinWrite);
		return false;
	}
	SetHandleInformation(hStdoutRead, HANDLE_FLAG_INHERIT, 0);

	// 创建 stderr 管道（除非合并到 stdout）
	HANDLE hStderrRead = INVALID_HANDLE_VALUE;
	HANDLE hStderrWrite = INVALID_HANDLE_VALUE;
	if (!Options.bMergeStderr)
	{
		if (!CreatePipe(&hStderrRead, &hStderrWrite, &SA, 0))
		{
			UE_LOG(LogChildProcess, Error, TEXT("ChildProcess: CreatePipe for stderr failed, error=%d"), GetLastError());
			CloseHandle(hStdinRead);
			CloseHandle(hStdinWrite);
			CloseHandle(hStdoutRead);
			CloseHandle(hStdoutWrite);
			return false;
		}
		SetHandleInformation(hStderrRead, HANDLE_FLAG_INHERIT, 0);
	}

	// 配置 STARTUPINFO
	STARTUPINFOW SI;
	FMemory::Memzero(&SI, sizeof(SI));
	SI.cb = sizeof(SI);
	SI.dwFlags = STARTF_USESTDHANDLES;
	if (Options.bHideWindow)
	{
		SI.dwFlags |= STARTF_USESHOWWINDOW;
		SI.wShowWindow = SW_HIDE;
	}
	SI.hStdInput = hStdinRead;
	SI.hStdOutput = hStdoutWrite;
	SI.hStdError = Options.bMergeStderr ? hStdoutWrite : hStderrWrite;

	// 构建命令行: "Executable" Args
	FString CommandLine = FString::Printf(TEXT("\"%s\" %s"), *Executable, *Args);

	// 构建环境块（如果有自定义环境变量）
	TArray<WCHAR> EnvBlock;
	LPVOID lpEnvironment = nullptr;
	DWORD CreationFlags = CREATE_UNICODE_ENVIRONMENT;

	if (Options.Environment.Num() > 0)
	{
		// 获取当前环境
		LPWCH CurrentEnv = GetEnvironmentStringsW();
		if (CurrentEnv)
		{
			// 解析当前环境到 Map
			TMap<FString, FString> EnvMap;
			LPWCH Ptr = CurrentEnv;
			while (*Ptr)
			{
				FString Entry(Ptr);
				int32 EqIndex;
				if (Entry.FindChar(TEXT('='), EqIndex) && EqIndex > 0)
				{
					EnvMap.Add(Entry.Left(EqIndex), Entry.Mid(EqIndex + 1));
				}
				Ptr += Entry.Len() + 1;
			}
			FreeEnvironmentStringsW(CurrentEnv);

			// 合并自定义环境变量
			for (const auto& Pair : Options.Environment)
			{
				EnvMap.Add(Pair.Key, Pair.Value);
			}

			// 构建环境块
			for (const auto& Pair : EnvMap)
			{
				FString Entry = FString::Printf(TEXT("%s=%s"), *Pair.Key, *Pair.Value);
				EnvBlock.Append(*Entry, Entry.Len());
				EnvBlock.Add(TEXT('\0'));
			}
			EnvBlock.Add(TEXT('\0')); // 双 null 结尾

			lpEnvironment = EnvBlock.GetData();
		}
	}

	// 创建进程
	PROCESS_INFORMATION ProcInfo;
	FMemory::Memzero(&ProcInfo, sizeof(ProcInfo));

	BOOL bSuccess = CreateProcessW(
		nullptr,
		CommandLine.GetCharArray().GetData(),
		nullptr,
		nullptr,
		TRUE, // 继承 handle
		CreationFlags,
		lpEnvironment,
		Options.WorkingDir.IsEmpty() ? nullptr : *Options.WorkingDir,
		&SI,
		&ProcInfo);

	// 关闭子端 handle（父端不需要）
	CloseHandle(hStdinRead);
	CloseHandle(hStdoutWrite);
	if (hStderrWrite != INVALID_HANDLE_VALUE)
	{
		CloseHandle(hStderrWrite);
	}

	if (!bSuccess)
	{
		UE_LOG(LogChildProcess, Error, TEXT("ChildProcess: CreateProcess failed for '%s', error=%d"), *Executable, GetLastError());
		CloseHandle(hStdinWrite);
		CloseHandle(hStdoutRead);
		if (hStderrRead != INVALID_HANDLE_VALUE)
		{
			CloseHandle(hStderrRead);
		}
		return false;
	}

	// 保存 handle
	ChildProcessHandle = ProcInfo.hProcess;
	ChildThreadHandle = ProcInfo.hThread;
	ProcessId = static_cast<int32>(ProcInfo.dwProcessId);
	StdinWritePipe = hStdinWrite;
	StdoutReadPipe = hStdoutRead;
	StderrReadPipe = hStderrRead;
	bIsRunning = true;

	UE_LOG(LogChildProcess, Display, TEXT("ChildProcess: Spawned '%s' (PID=%d)"), *Executable, ProcessId);

	StartTicker();
	return true;
}

bool UChildProcess::WriteStdin(const FString& Text)
{
	if (StdinWritePipe == INVALID_HANDLE_VALUE)
	{
		return false;
	}

	FTCHARToUTF8 Utf8(*Text, Text.Len());
	DWORD BytesWritten = 0;
	BOOL Result = WriteFile(StdinWritePipe, Utf8.Get(), Utf8.Length(), &BytesWritten, nullptr);
	if (!Result)
	{
		UE_LOG(LogChildProcess, Error, TEXT("ChildProcess: WriteStdin failed, error=%d"), GetLastError());
		return false;
	}
	return true;
}

bool UChildProcess::WriteStdinBuffer(const FArrayBuffer& Buffer)
{
	if (StdinWritePipe == INVALID_HANDLE_VALUE || Buffer.Data == nullptr || Buffer.Length == 0)
	{
		return false;
	}

	DWORD BytesWritten = 0;
	BOOL Result = WriteFile(StdinWritePipe, Buffer.Data, static_cast<DWORD>(Buffer.Length), &BytesWritten, nullptr);
	if (!Result)
	{
		UE_LOG(LogChildProcess, Error, TEXT("ChildProcess: WriteStdinBuffer failed, error=%d"), GetLastError());
		return false;
	}
	return true;
}

void UChildProcess::CloseStdin()
{
	if (StdinWritePipe != INVALID_HANDLE_VALUE)
	{
		CloseHandle(StdinWritePipe);
		StdinWritePipe = INVALID_HANDLE_VALUE;
	}
}

FArrayBuffer UChildProcess::ReadStdout()
{
	FArrayBuffer Result;
	if (StdoutPendingData.Num() > 0)
	{
		Result.Data = StdoutPendingData.GetData();
		Result.Length = StdoutPendingData.Num();
		Result.bCopy = true;
	}
	else
	{
		Result.Data = nullptr;
		Result.Length = 0;
	}
	return Result;
}

FArrayBuffer UChildProcess::ReadStderr()
{
	FArrayBuffer Result;
	if (StderrPendingData.Num() > 0)
	{
		Result.Data = StderrPendingData.GetData();
		Result.Length = StderrPendingData.Num();
		Result.bCopy = true;
	}
	else
	{
		Result.Data = nullptr;
		Result.Length = 0;
	}
	return Result;
}

FString UChildProcess::ReadStdoutString()
{
	if (StdoutPendingData.Num() == 0)
	{
		return FString();
	}
	FUTF8ToTCHAR Conv(
		reinterpret_cast<const ANSICHAR*>(StdoutPendingData.GetData()),
		StdoutPendingData.Num());
	return FString(Conv.Length(), Conv.Get());
}

FString UChildProcess::ReadStderrString()
{
	if (StderrPendingData.Num() == 0)
	{
		return FString();
	}
	FUTF8ToTCHAR Conv(
		reinterpret_cast<const ANSICHAR*>(StderrPendingData.GetData()),
		StderrPendingData.Num());
	return FString(Conv.Length(), Conv.Get());
}

void UChildProcess::Kill(bool bKillTree)
{
	if (ChildProcessHandle == INVALID_HANDLE_VALUE || !bIsRunning)
	{
		return;
	}
	TerminateProcess(ChildProcessHandle, 1);
	// 退出将在下一次 tick 中检测到
}

bool UChildProcess::OnTick(float DeltaTime)
{
	// 轮询 stdout
	if (StdoutReadPipe != INVALID_HANDLE_VALUE)
	{
		PollPipe(StdoutReadPipe, StdoutPendingData, false);
	}

	// 轮询 stderr
	if (StderrReadPipe != INVALID_HANDLE_VALUE)
	{
		PollPipe(StderrReadPipe, StderrPendingData, true);
	}

	// 检查进程是否退出
	if (bIsRunning && ChildProcessHandle != INVALID_HANDLE_VALUE)
	{
		DWORD WaitResult = WaitForSingleObject(ChildProcessHandle, 0);
		if (WaitResult == WAIT_OBJECT_0)
		{
			DWORD Code = 0;
			GetExitCodeProcess(ChildProcessHandle, &Code);
			ExitCode = static_cast<int32>(Code);
			bIsRunning = false;

			// drain 管道中剩余数据
			if (StdoutReadPipe != INVALID_HANDLE_VALUE)
			{
				PollPipe(StdoutReadPipe, StdoutPendingData, false);
			}
			if (StderrReadPipe != INVALID_HANDLE_VALUE)
			{
				PollPipe(StderrReadPipe, StderrPendingData, true);
			}

			UE_LOG(LogChildProcess, Display, TEXT("ChildProcess: Process exited (PID=%d, ExitCode=%d)"), ProcessId, ExitCode);

			if (!bExitFired)
			{
				bExitFired = true;
				OnExit.Broadcast();
			}

			Cleanup();
			return false; // 注销 ticker
		}
	}

	return true;
}

void UChildProcess::PollPipe(void* PipeHandle, TArray<uint8>& PendingBuffer, bool bIsStderr)
{
	DWORD BytesAvailable = 0;
	if (!PeekNamedPipe(PipeHandle, nullptr, 0, nullptr, &BytesAvailable, nullptr))
	{
		return; // 管道断开，将在退出检查中处理
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
	if (ReadFile(PipeHandle, ReadBuf.GetData(), BytesAvailable, &BytesRead, nullptr) && BytesRead > 0)
	{
		PendingBuffer.Empty();
		PendingBuffer.Append(ReadBuf.GetData(), BytesRead);

		if (bIsStderr)
		{
			OnStderrDataAvailable.Broadcast();
		}
		else
		{
			OnStdoutDataAvailable.Broadcast();
		}
	}
}

void UChildProcess::Cleanup()
{
	if (StdinWritePipe != INVALID_HANDLE_VALUE)
	{
		CloseHandle(StdinWritePipe);
		StdinWritePipe = INVALID_HANDLE_VALUE;
	}
	if (StdoutReadPipe != INVALID_HANDLE_VALUE)
	{
		CloseHandle(StdoutReadPipe);
		StdoutReadPipe = INVALID_HANDLE_VALUE;
	}
	if (StderrReadPipe != INVALID_HANDLE_VALUE)
	{
		CloseHandle(StderrReadPipe);
		StderrReadPipe = INVALID_HANDLE_VALUE;
	}
	if (ChildThreadHandle != INVALID_HANDLE_VALUE)
	{
		CloseHandle(ChildThreadHandle);
		ChildThreadHandle = INVALID_HANDLE_VALUE;
	}
	if (ChildProcessHandle != INVALID_HANDLE_VALUE)
	{
		CloseHandle(ChildProcessHandle);
		ChildProcessHandle = INVALID_HANDLE_VALUE;
	}

	StdoutPendingData.Empty();
	StderrPendingData.Empty();
}

#include "Windows/HideWindowsPlatformTypes.h"
