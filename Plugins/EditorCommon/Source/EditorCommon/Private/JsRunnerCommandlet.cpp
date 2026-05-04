#include "JsRunnerCommandlet.h"
#include "JsRunHelper.h"
#include "JsEnv.h"
#include "ProcessIOHelper.h"
#include "Containers/Ticker.h"
#include "HAL/FileManager.h"
#include "HAL/PlatformProcess.h"
#include "Misc/Paths.h"

DEFINE_LOG_CATEGORY_STATIC(LogJsRunner, Log, All);

UJsRunnerCommandlet::UJsRunnerCommandlet()
{
	IsClient = false;
	IsEditor = false;
	IsServer = false;
	LogToConsole = true;
}

namespace
{
	using FFileSnapshot = TMap<FString, int64>;

	// 拍当前快照（RelativePath -> ModifiedTicks）
	FFileSnapshot TakeSnapshot(const FString& RootDir, const TArray<FString>& Extensions)
	{
		FFileSnapshot Out;
		const TArray<FFileTimestampEntry> Entries = UProcessIOHelper::ListFilesRecursive(RootDir, Extensions);
		Out.Reserve(Entries.Num());
		for (const FFileTimestampEntry& E : Entries)
		{
			Out.Add(E.RelativePath, E.ModifiedTicks);
		}
		return Out;
	}

	bool SnapshotsEqual(const FFileSnapshot& A, const FFileSnapshot& B)
	{
		if (A.Num() != B.Num()) return false;
		for (const auto& Pair : A)
		{
			const int64* Val = B.Find(Pair.Key);
			if (!Val || *Val != Pair.Value) return false;
		}
		return true;
	}

	// 检查退出信号：watch-stop 文件优先（Editor-Cmd 通常无 TTY，stdin 仅作开发期辅助）
	bool CheckStopSignal(const FString& WatchRoot)
	{
		const FString StopFile = WatchRoot / TEXT(".watch-stop");
		if (IFileManager::Get().FileExists(*StopFile))
		{
			UE_LOG(LogJsRunner, Display, TEXT("[watch] .watch-stop detected, quitting"));
			IFileManager::Get().Delete(*StopFile);
			return true;
		}
		if (UProcessIOHelper::HasStdinInput())
		{
			const FString Line = UProcessIOHelper::ReadStdinLine();
			const FString Trimmed = Line.TrimStartAndEnd().ToLower();
			if (Trimmed == TEXT("q") || Trimmed == TEXT("quit") || Trimmed == TEXT("exit"))
			{
				UE_LOG(LogJsRunner, Display, TEXT("[watch] '%s' on stdin, quitting"), *Trimmed);
				return true;
			}
		}
		return false;
	}

	// 跑一轮：构造 JsEnv → Start → ticker 循环到 MarkDone/Timeout → 销毁
	// 出错（启动失败、超时）返回非零；正常完成返回 UJsRunHelper::ExitCode
	int32 RunOnce(const FString& ModuleName, double TimeoutSeconds, const FString& JsRawArgs, int32 DebugPort, bool bWaitDebugger)
	{
		UJsRunHelper::Reset();
		UJsRunHelper::CommandArgs = JsRawArgs;

		auto Loader = std::make_shared<puerts::DefaultJSModuleLoader>(TEXT("JavaScript"));
		Loader->AddSearchPath(FPaths::ProjectDir());

		puerts::FJsEnv JsEnv(
			Loader,
			std::make_shared<puerts::FDefaultLogger>(), DebugPort);

		if (bWaitDebugger)
		{
			UE_LOG(LogJsRunner, Display, TEXT("JsRunner: Waiting for debugger on port %d..."), DebugPort);
			JsEnv.WaitDebugger(0);
		}

		if (!JsEnv.Start(ModuleName))
		{
			UE_LOG(LogJsRunner, Error, TEXT("JsRunner: Failed to start module '%s'"), *ModuleName);
			return 1;
		}

		const double StartTime = FPlatformTime::Seconds();

		while (!UJsRunHelper::bDone)
		{
			FTaskGraphInterface::Get().ProcessThreadUntilIdle(ENamedThreads::GameThread);
			FTSTicker::GetCoreTicker().Tick(FApp::GetDeltaTime());
			FPlatformProcess::Sleep(0.01f);

			if (TimeoutSeconds > 0 && FPlatformTime::Seconds() - StartTime > TimeoutSeconds)
			{
				UE_LOG(LogJsRunner, Error, TEXT("JsRunner: Timed out after %.0f seconds"), TimeoutSeconds);
				return 1;
			}
		}

		return UJsRunHelper::ExitCode;
	}
}

int32 UJsRunnerCommandlet::Main(const FString& Params)
{
	// 以 " -- " 为界：之前由 UE 解析，之后原样传给 JS
	FString UeParams = Params;
	FString JsRawArgs;

	const int32 SepIndex = Params.Find(TEXT(" -- "));
	if (SepIndex != INDEX_NONE)
	{
		UeParams = Params.Left(SepIndex);
		JsRawArgs = Params.Mid(SepIndex + 4).TrimStartAndEnd();
	}

	TArray<FString> Tokens;
	TArray<FString> Switches;
	TMap<FString, FString> ParamMap;
	ParseCommandLine(*UeParams, Tokens, Switches, ParamMap);

	// -module= 必填
	FString ModuleName;
	if (ParamMap.Contains(TEXT("module")))
	{
		ModuleName = ParamMap[TEXT("module")];
	}
	else
	{
		UE_LOG(LogJsRunner, Error, TEXT("JsRunner: -module=<name> is required"));
		return 1;
	}

	// -timeout= 默认 0（无超时）
	double TimeoutSeconds = 0.0;
	if (ParamMap.Contains(TEXT("timeout")))
	{
		TimeoutSeconds = FCString::Atod(*ParamMap[TEXT("timeout")]);
	}

	// -JsEnvDebugPort=<port> 启用 V8 Inspector，-waitDebugger 阻塞直到调试器连接
	int32 DebugPort = -1;
	if (ParamMap.Contains(TEXT("JsEnvDebugPort")))
	{
		DebugPort = FCString::Atoi(*ParamMap[TEXT("JsEnvDebugPort")]);
	}
	const bool bWaitDebugger = Switches.Contains(TEXT("waitDebugger"));

	const bool bWatch = Switches.Contains(TEXT("watch"));

	if (!bWatch)
	{
		UE_LOG(LogJsRunner, Display, TEXT("JsRunner: Running module '%s' (timeout=%.0fs)"), *ModuleName, TimeoutSeconds);
		const int32 Code = RunOnce(ModuleName, TimeoutSeconds, JsRawArgs, DebugPort, bWaitDebugger);
		UE_LOG(LogJsRunner, Display, TEXT("JsRunner: Completed with exit code %d"), Code);
		return Code;
	}

	// ===== watch 模式 =====
	const FString WatchRoot = ParamMap.Contains(TEXT("watch-root"))
		? ParamMap[TEXT("watch-root")]
		: FPaths::ProjectContentDir() / TEXT("JavaScript");
	const TArray<FString> Exts = { TEXT("js") };
	const double IntervalSec = ParamMap.Contains(TEXT("watch-interval"))
		? FMath::Max(0.05, FCString::Atod(*ParamMap[TEXT("watch-interval")]) / 1000.0)
		: 0.75;
	const double DebounceSec = 0.30;

	UE_LOG(LogJsRunner, Display, TEXT("[watch] Mode enabled. root=%s interval=%.2fs"), *WatchRoot, IntervalSec);
	UE_LOG(LogJsRunner, Display, TEXT("[watch] Stop with: touch %s/.watch-stop  or input 'q' on stdin"), *WatchRoot);

	bool bShouldQuit = false;
	bool bFirstRun = true;

	while (!bShouldQuit)
	{
		UE_LOG(LogJsRunner, Display, TEXT("[watch] %s test run..."), bFirstRun ? TEXT("Initial") : TEXT("Re-running"));
		bFirstRun = false;

		const double T0 = FPlatformTime::Seconds();
		const int32 Code = RunOnce(ModuleName, TimeoutSeconds, JsRawArgs, DebugPort, bWaitDebugger);
		const double Elapsed = FPlatformTime::Seconds() - T0;
		UE_LOG(LogJsRunner, Display, TEXT("[watch] Run done in %.2fs (exit=%d)"), Elapsed, Code);

		// 在重新拍快照前先驱动一次 ticker，让 JsEnv 销毁产生的清理任务跑完
		FTaskGraphInterface::Get().ProcessThreadUntilIdle(ENamedThreads::GameThread);
		FTSTicker::GetCoreTicker().Tick(0.01f);

		FFileSnapshot Snapshot = TakeSnapshot(WatchRoot, Exts);
		UE_LOG(LogJsRunner, Display, TEXT("[watch] Watching %d files. Waiting for changes..."), Snapshot.Num());

		while (!bShouldQuit)
		{
			if (CheckStopSignal(WatchRoot))
			{
				bShouldQuit = true;
				break;
			}

			FPlatformProcess::Sleep(IntervalSec);
			FTSTicker::GetCoreTicker().Tick(IntervalSec);

			FFileSnapshot Next = TakeSnapshot(WatchRoot, Exts);
			if (SnapshotsEqual(Snapshot, Next))
			{
				continue;
			}

			// 防抖：等 DebounceSec 再拍一次，连续两次相同才认为稳定
			FPlatformProcess::Sleep(DebounceSec);
			FTSTicker::GetCoreTicker().Tick(DebounceSec);
			FFileSnapshot Stable = TakeSnapshot(WatchRoot, Exts);
			if (SnapshotsEqual(Next, Stable))
			{
				UE_LOG(LogJsRunner, Display, TEXT("[watch] Detected stable change, re-running tests..."));
				break;
			}

			// 仍在变化：用 Stable 作为新基线，下一轮再判
			Snapshot = Stable;
		}
	}

	UE_LOG(LogJsRunner, Display, TEXT("[watch] Quit"));
	return 0;
}
