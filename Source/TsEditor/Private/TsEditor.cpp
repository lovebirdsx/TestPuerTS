#include "TsEditor.h"
#include "TsEditorModule.h"
#include "Sockets.h"
#include "SocketSubsystem.h"
#include "IPAddress.h"

#if PLATFORM_WINDOWS
#include "Windows/AllowWindowsPlatformTypes.h"
#include <winsock2.h>
#include <ws2tcpip.h>
#include <iphlpapi.h>
#include "Windows/HideWindowsPlatformTypes.h"
#pragma comment(lib, "iphlpapi.lib")
#pragma comment(lib, "ws2_32.lib")
#endif

class FLoggerForJs : public puerts::ILogger
{
public:
	explicit FLoggerForJs(UTsEditor *TsEditor): TsEditor(TsEditor)
	{
	}
	
	virtual ~FLoggerForJs()
	{
	}

	virtual void Log(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Log, TEXT("%s"), *Message);		
	}

	virtual void Info(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Display, TEXT("%s"), *Message);
	}

	virtual void Warn(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Warning, TEXT("%s"), *Message);
	}

	virtual void Error(const FString& Message) const override
	{
		UE_LOG(LogTsEditor, Error, TEXT("%s"), *Message);
		if (TsEditor)
		{
			TsEditor->FireLogErrorEvent(Message);
		}
	}

private:
	UTsEditor *TsEditor;
};

UTsEditor::UTsEditor() : bWaitJSDebug(false), ModuleName(TEXT("editor/main")), DebugPort(40000)
{
}

// 检查端口是否被其他进程占用。
//
// Windows 的 SO_REUSEADDR 是共享语义（不同于 Unix），加上 PuerTS 显式 set_reuse_addr(true)，
// 一旦端口被设过 SO_REUSEADDR 的 socket 绑过，bind/listen 探测都会"成功"，根本探测不出来。
// 即使僵尸进程已死、内核 TCP 表里仍挂着 LISTEN 句柄时，bind 探测同样无效。
//
// 因此直接走 netstat 的底层 API GetExtendedTcpTable，扫描 TCP 表里所有 LISTEN 条目，
// 只要本端口被任何"非自己"的进程占用就视为不可用。
static bool IsDebugPortAvailable(int32 Port)
{
#if PLATFORM_WINDOWS
	const DWORD MyPid = GetCurrentProcessId();
	const uint16 TargetPort = static_cast<uint16>(Port);

	auto ScanTable = [&](ULONG Family) -> int32
	{
		ULONG Size = 0;
		GetExtendedTcpTable(nullptr, &Size, 0, Family, TCP_TABLE_OWNER_PID_LISTENER, 0);
		if (Size == 0)
		{
			return 0;
		}

		TArray<uint8> Buffer;
		Buffer.SetNumUninitialized(Size);
		const DWORD Result = GetExtendedTcpTable(Buffer.GetData(), &Size, 0, Family, TCP_TABLE_OWNER_PID_LISTENER, 0);
		if (Result != NO_ERROR)
		{
			UE_LOG(LogTsEditor, Warning, TEXT("[PortProbe] GetExtendedTcpTable failed (family=%lu): %lu"), Family, Result);
			return 0;
		}

		int32 ForeignListeners = 0;
		if (Family == AF_INET)
		{
			const auto* Table = reinterpret_cast<const MIB_TCPTABLE_OWNER_PID*>(Buffer.GetData());
			for (DWORD i = 0; i < Table->dwNumEntries; ++i)
			{
				const MIB_TCPROW_OWNER_PID& Row = Table->table[i];
				if (ntohs(static_cast<uint16>(Row.dwLocalPort)) == TargetPort && Row.dwOwningPid != MyPid)
				{
					++ForeignListeners;
					UE_LOG(LogTsEditor, Warning, TEXT("[PortProbe] IPv4 LISTEN on %d held by PID %lu"), Port, Row.dwOwningPid);
				}
			}
		}
		else
		{
			const auto* Table = reinterpret_cast<const MIB_TCP6TABLE_OWNER_PID*>(Buffer.GetData());
			for (DWORD i = 0; i < Table->dwNumEntries; ++i)
			{
				const MIB_TCP6ROW_OWNER_PID& Row = Table->table[i];
				if (ntohs(static_cast<uint16>(Row.dwLocalPort)) == TargetPort && Row.dwOwningPid != MyPid)
				{
					++ForeignListeners;
					UE_LOG(LogTsEditor, Warning, TEXT("[PortProbe] IPv6 LISTEN on %d held by PID %lu"), Port, Row.dwOwningPid);
				}
			}
		}
		return ForeignListeners;
	};

	const int32 Total = ScanTable(AF_INET) + ScanTable(AF_INET6);
	return Total == 0;
#else
	ISocketSubsystem* SocketSubsystem = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM);
	if (!SocketSubsystem)
	{
		return true;
	}

	FSocket* Probe = SocketSubsystem->CreateSocket(NAME_Stream, TEXT("TsEditorPortProbe"), false);
	if (!Probe)
	{
		return true;
	}

	TSharedRef<FInternetAddr> Addr = SocketSubsystem->CreateInternetAddr();
	bool bIsValid = false;
	Addr->SetIp(TEXT("0.0.0.0"), bIsValid);
	Addr->SetPort(Port);

	const bool bBound = bIsValid && Probe->Bind(*Addr);
	Probe->Close();
	SocketSubsystem->DestroySocket(Probe);
	return bBound;
#endif
}

void UTsEditor::Start()
{
	TryStart();
}

bool UTsEditor::TryStart()
{
	if (IsRunning())
	{
		UE_LOG(LogTsEditor, Error, TEXT("Can not run ts editor again while is already running"));
		return false;
	}

	SetState(ETsEditorState::Starting);
	LastStartError.Empty();

	int32 EffectiveDebugPort = DebugPort;
	if (DebugPort > 0 && !IsDebugPortAvailable(DebugPort))
	{
		UE_LOG(LogTsEditor, Error,
			TEXT("Debug port %d is in use (likely a leftover socket from a previous PuerTS instance). ")
			TEXT("V8 Inspector will be disabled for this run; VSCode debugger cannot attach. ")
			TEXT("To fix: close the occupying process (TCPView), restart Windows, or change DebugPort in Project Settings."),
			DebugPort);
		EffectiveDebugPort = -1;
	}

	JsEnv = MakeShared<puerts::FJsEnv>(std::make_unique<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")), std::make_shared<FLoggerForJs>(this), EffectiveDebugPort);

	if (bWaitJSDebug)
	{
		if (EffectiveDebugPort < 0)
		{
			UE_LOG(LogTsEditor, Warning, TEXT("WaitJSDebug requested but debug port unavailable; skipping wait."));
		}
		else
		{
			JsEnv->WaitDebugger();
		}
	}

	const TArray<TPair<FString, UObject*>> Arguments;
	if (!JsEnv->Start(ModuleName, Arguments))
	{
		if (LastStartError.IsEmpty())
		{
			LastStartError = FString::Printf(TEXT("Failed to start TsEditor module: %s"), *ModuleName);
		}
		UE_LOG(LogTsEditor, Error, TEXT("%s"), *LastStartError);
		JsEnv.Reset();
		SetState(ETsEditorState::Failed);
		OnStartFailed.Broadcast(LastStartError);
		return false;
	}

	SetState(ETsEditorState::Running);
	OnStarted.Broadcast();
	return true;
}

void UTsEditor::Stop()
{
	if (JsEnv.IsValid())
	{
		OnStopped.Broadcast();
		if (FModuleManager::Get().IsModuleLoaded("TsEditor"))
		{
			FModuleManager::GetModuleChecked<FTsEditorModule>("TsEditor").UnregisterMenuEntriesByOwner(TEXT("TsEditorJS"));
		}
		JsEnv.Reset();
	}
	SetState(ETsEditorState::Stopped);
}

void UTsEditor::Restart()
{
	if (bIsRestarting)
		return;

	bIsRestarting = true;
	SetState(ETsEditorState::Restarting);


	// 通过延时来执行,防止在ts中释放虚拟机造成报错
	FTimerHandle UnusedHandle;
	GEditor->GetTimerManager()->SetTimer(UnusedHandle, [this]()
	{
		Stop();
		TryStart();
		bIsRestarting = false;
	}, 0.1, false);
}

bool UTsEditor::IsRunning()
{
	return State == ETsEditorState::Running && JsEnv.IsValid();
}

FString UTsEditor::CurrentStackTrace()
{	
	return JsEnv.IsValid() ? JsEnv.Get()->CurrentStackTrace() : FString();
}

FString UTsEditor::GetLastStartError() const
{
	return LastStartError;
}

ETsEditorState UTsEditor::GetState() const
{
	return State;
}

void UTsEditor::FireLogErrorEvent(const FString& Message)
{
	if (State == ETsEditorState::Starting || State == ETsEditorState::Failed)
	{
		LastStartError = Message;
	}
	OnLogError.Broadcast(Message);
}

void UTsEditor::SetState(ETsEditorState InState)
{
	State = InState;
}
