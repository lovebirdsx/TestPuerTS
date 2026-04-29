#include "JsRunHelper.h"
#include "HAL/PlatformProcess.h"
#include "Misc/Paths.h"

bool UJsRunHelper::bDone = false;
int32 UJsRunHelper::ExitCode = 0;
FString UJsRunHelper::CommandArgs;
TMap<int32, FProcHandle> UJsRunHelper::ManagedProcesses;
int32 UJsRunHelper::NextProcessId = 1;

void UJsRunHelper::MarkDone(int32 InExitCode)
{
	bDone = true;
	ExitCode = InExitCode;
	UE_LOG(LogTemp, Display, TEXT("JsRunHelper: MarkDone called with ExitCode=%d"), InExitCode);
}

FString UJsRunHelper::GetCommandArgs()
{
	return CommandArgs;
}

int32 UJsRunHelper::SpawnProcess(const FString& Executable, const FString& Args, const FString& WorkingDir)
{
	uint32 OutProcessId = 0;
	FProcHandle Handle = FPlatformProcess::CreateProc(
		*Executable,
		*Args,
		true,   // bLaunchDetached
		true,   // bLaunchHidden
		true,   // bLaunchReallyHidden
		&OutProcessId,
		0,      // PriorityModifier
		WorkingDir.IsEmpty() ? nullptr : *WorkingDir,
		nullptr // PipeWriteChild
	);

	if (!Handle.IsValid())
	{
		UE_LOG(LogTemp, Error, TEXT("JsRunHelper: Failed to spawn process: %s %s"), *Executable, *Args);
		return -1;
	}

	int32 Id = NextProcessId++;
	ManagedProcesses.Add(Id, Handle);
	UE_LOG(LogTemp, Display, TEXT("JsRunHelper: Spawned process %d (PID=%u): %s %s"), Id, OutProcessId, *Executable, *Args);
	return Id;
}

bool UJsRunHelper::IsProcessRunning(int32 ProcessId)
{
	FProcHandle* Handle = ManagedProcesses.Find(ProcessId);
	if (!Handle)
	{
		return false;
	}
	return FPlatformProcess::IsProcRunning(*Handle);
}

void UJsRunHelper::KillProcess(int32 ProcessId)
{
	FProcHandle* Handle = ManagedProcesses.Find(ProcessId);
	if (!Handle)
	{
		return;
	}

	if (FPlatformProcess::IsProcRunning(*Handle))
	{
		FPlatformProcess::TerminateProc(*Handle, true);
		UE_LOG(LogTemp, Display, TEXT("JsRunHelper: Killed process %d"), ProcessId);
	}

	FPlatformProcess::CloseProc(*Handle);
	ManagedProcesses.Remove(ProcessId);
}

FString UJsRunHelper::GetProjectDir()
{
	return FPaths::ConvertRelativePathToFull(FPaths::ProjectDir());
}

void UJsRunHelper::Reset()
{
	bDone = false;
	ExitCode = 0;
	CommandArgs.Empty();

	// 清理所有托管进程
	for (auto& Pair : ManagedProcesses)
	{
		if (FPlatformProcess::IsProcRunning(Pair.Value))
		{
			FPlatformProcess::TerminateProc(Pair.Value, true);
		}
		FPlatformProcess::CloseProc(Pair.Value);
	}
	ManagedProcesses.Empty();
}
