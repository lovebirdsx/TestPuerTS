#include "ACPClientCommandlet.h"
#include "PuertsTestHelper.h"
#include "JsEnv.h"
#include "Containers/Ticker.h"

DEFINE_LOG_CATEGORY_STATIC(LogACPClient, Log, All);

UACPClientCommandlet::UACPClientCommandlet()
{
	IsClient = false;
	IsEditor = false;
	IsServer = false;
	LogToConsole = true;
}

int32 UACPClientCommandlet::Main(const FString& Params)
{
	FString ModuleName = TEXT("acp-client/index");

	TArray<FString> Tokens;
	TArray<FString> Switches;
	TMap<FString, FString> ParamMap;
	ParseCommandLine(*Params, Tokens, Switches, ParamMap);

	if (ParamMap.Contains(TEXT("module")))
	{
		ModuleName = ParamMap[TEXT("module")];
	}

	double TimeoutSeconds = 600.0;
	if (ParamMap.Contains(TEXT("timeout")))
	{
		TimeoutSeconds = FCString::Atod(*ParamMap[TEXT("timeout")]);
	}

	UE_LOG(LogACPClient, Display, TEXT("ACPClient: Running module '%s' (timeout=%.0fs)"), *ModuleName, TimeoutSeconds);

	UPuertsTestHelper::Reset();

	// 将命令行参数转发给 JS（通过 TestFilter 传递）
	FString CmdArgs;
	for (const auto& Pair : ParamMap)
	{
		if (Pair.Key != TEXT("module") && Pair.Key != TEXT("timeout"))
		{
			CmdArgs += FString::Printf(TEXT("--%s=%s "), *Pair.Key, *Pair.Value);
		}
	}
	for (const auto& Token : Tokens)
	{
		CmdArgs += Token + TEXT(" ");
	}
	UPuertsTestHelper::TestFilter = CmdArgs.TrimEnd();

	{
		auto Loader = std::make_shared<puerts::DefaultJSModuleLoader>(TEXT("JavaScript"));
		Loader->AddSearchPath(FPaths::ProjectDir());

		puerts::FJsEnv JsEnv(
			Loader,
			std::make_shared<puerts::FDefaultLogger>(), -1);

		if (!JsEnv.Start(ModuleName))
		{
			UE_LOG(LogACPClient, Error, TEXT("ACPClient: Failed to start module '%s'"), *ModuleName);
			return 1;
		}

		const double StartTime = FPlatformTime::Seconds();

		while (!UPuertsTestHelper::bTestDone)
		{
			FTaskGraphInterface::Get().ProcessThreadUntilIdle(ENamedThreads::GameThread);
			FTSTicker::GetCoreTicker().Tick(FApp::GetDeltaTime());
			FPlatformProcess::Sleep(0.01f);

			if (TimeoutSeconds > 0 && FPlatformTime::Seconds() - StartTime > TimeoutSeconds)
			{
				UE_LOG(LogACPClient, Error, TEXT("ACPClient: Timed out after %.0f seconds"), TimeoutSeconds);
				return 1;
			}
		}
	}

	UE_LOG(LogACPClient, Display, TEXT("ACPClient: Completed with exit code %d"), UPuertsTestHelper::TestExitCode);
	return UPuertsTestHelper::TestExitCode;
}
