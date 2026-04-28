#include "PuertsTestCommandlet.h"
#include "PuertsTestHelper.h"
#include "JsEnv.h"
#include "Containers/Ticker.h"
#include "Tasks/Pipe.h"

DEFINE_LOG_CATEGORY_STATIC(LogPuertsTest, Log, All);

UPuertsTestCommandlet::UPuertsTestCommandlet()
{
	IsClient = false;
	IsEditor = false;
	IsServer = false;
	LogToConsole = true;
}

int32 UPuertsTestCommandlet::Main(const FString& Params)
{
	FString ModuleName = TEXT("tests/main");

	TArray<FString> Tokens;
	TArray<FString> Switches;
	TMap<FString, FString> ParamMap;
	ParseCommandLine(*Params, Tokens, Switches, ParamMap);

	if (ParamMap.Contains(TEXT("module")))
	{
		ModuleName = ParamMap[TEXT("module")];
	}

	double TimeoutSeconds = 30.0;
	if (ParamMap.Contains(TEXT("timeout")))
	{
		TimeoutSeconds = FCString::Atod(*ParamMap[TEXT("timeout")]);
	}

	FString TestFilter;
	if (ParamMap.Contains(TEXT("test")))
	{
		TestFilter = ParamMap[TEXT("test")];
	}

	UE_LOG(LogPuertsTest, Display, TEXT("PuertsTest: Running module '%s' (timeout=%.0fs, test='%s')"), *ModuleName, TimeoutSeconds, *TestFilter);

	UPuertsTestHelper::Reset();
	UPuertsTestHelper::TestFilter = TestFilter;

	{
		puerts::FJsEnv JsEnv(
			std::make_shared<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")),
			std::make_shared<puerts::FDefaultLogger>(), -1);

		JsEnv.Start(ModuleName);

		// Tick 循环：驱动 PuerTS 的 libuv 事件循环和 UE ticker，等待 JS 调用 MarkTestDone
		const double StartTime = FPlatformTime::Seconds();

		while (!UPuertsTestHelper::bTestDone)
		{
			// 处理 GameThread 任务队列（PuerTS 的 UvRunOnce 通过此机制调度）
			FTaskGraphInterface::Get().ProcessThreadUntilIdle(ENamedThreads::GameThread);

			// 处理 UE ticker 回调（setTimeout/setInterval 等）
			FTSTicker::GetCoreTicker().Tick(FApp::GetDeltaTime());

			FPlatformProcess::Sleep(0.01f);

			if (FPlatformTime::Seconds() - StartTime > TimeoutSeconds)
			{
				UE_LOG(LogPuertsTest, Error, TEXT("PuertsTest: Timed out after %.0f seconds"), TimeoutSeconds);
				return 1;
			}
		}
	}

	UE_LOG(LogPuertsTest, Display, TEXT("PuertsTest: Completed with exit code %d"), UPuertsTestHelper::TestExitCode);
	return UPuertsTestHelper::TestExitCode;
}
