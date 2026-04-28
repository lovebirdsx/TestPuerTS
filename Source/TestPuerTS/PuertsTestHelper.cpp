#include "PuertsTestHelper.h"
#include "HAL/PlatformProcess.h"
#include "Misc/Paths.h"

bool UPuertsTestHelper::bTestDone = false;
int32 UPuertsTestHelper::TestExitCode = 0;
FString UPuertsTestHelper::TestFilter;
TMap<int32, FProcHandle> UPuertsTestHelper::ManagedProcesses;
int32 UPuertsTestHelper::NextProcessId = 1;

void UPuertsTestHelper::MarkTestDone(int32 ExitCode)
{
	bTestDone = true;
	TestExitCode = ExitCode;
	UE_LOG(LogTemp, Display, TEXT("PuertsTestHelper: MarkTestDone called with ExitCode=%d"), ExitCode);
}

FString UPuertsTestHelper::GetTestFilter()
{
	return TestFilter;
}

int32 UPuertsTestHelper::SpawnProcess(const FString& Executable, const FString& Args, const FString& WorkingDir)
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
		UE_LOG(LogTemp, Error, TEXT("PuertsTestHelper: Failed to spawn process: %s %s"), *Executable, *Args);
		return -1;
	}

	int32 Id = NextProcessId++;
	ManagedProcesses.Add(Id, Handle);
	UE_LOG(LogTemp, Display, TEXT("PuertsTestHelper: Spawned process %d (PID=%u): %s %s"), Id, OutProcessId, *Executable, *Args);
	return Id;
}

bool UPuertsTestHelper::IsProcessRunning(int32 ProcessId)
{
	FProcHandle* Handle = ManagedProcesses.Find(ProcessId);
	if (!Handle)
	{
		return false;
	}
	return FPlatformProcess::IsProcRunning(*Handle);
}

void UPuertsTestHelper::KillProcess(int32 ProcessId)
{
	FProcHandle* Handle = ManagedProcesses.Find(ProcessId);
	if (!Handle)
	{
		return;
	}

	if (FPlatformProcess::IsProcRunning(*Handle))
	{
		FPlatformProcess::TerminateProc(*Handle, true);
		UE_LOG(LogTemp, Display, TEXT("PuertsTestHelper: Killed process %d"), ProcessId);
	}

	FPlatformProcess::CloseProc(*Handle);
	ManagedProcesses.Remove(ProcessId);
}

FString UPuertsTestHelper::GetProjectDir()
{
	return FPaths::ConvertRelativePathToFull(FPaths::ProjectDir());
}

void UPuertsTestHelper::Reset()
{
	bTestDone = false;
	TestExitCode = 0;
	TestFilter.Empty();

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
