#include "JsRunnerCommandlet.h"
#include "JsRunHelper.h"
#include "JsEnv.h"
#include "Containers/Ticker.h"

DEFINE_LOG_CATEGORY_STATIC(LogJsRunner, Log, All);

UJsRunnerCommandlet::UJsRunnerCommandlet()
{
	IsClient = false;
	IsEditor = false;
	IsServer = false;
	LogToConsole = true;
}

int32 UJsRunnerCommandlet::Main(const FString& Params)
{
	TArray<FString> Tokens;
	TArray<FString> Switches;
	TMap<FString, FString> ParamMap;
	ParseCommandLine(*Params, Tokens, Switches, ParamMap);

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

	UE_LOG(LogJsRunner, Display, TEXT("JsRunner: Running module '%s' (timeout=%.0fs)"), *ModuleName, TimeoutSeconds);

	UJsRunHelper::Reset();

	// 将未识别参数转发给 JS
	FString ExtraArgs;
	for (const auto& Pair : ParamMap)
	{
		if (Pair.Key != TEXT("module") && Pair.Key != TEXT("timeout")
			&& Pair.Key != TEXT("run") && Pair.Key != TEXT("DisablePlugins"))
		{
			ExtraArgs += FString::Printf(TEXT("--%s=%s "), *Pair.Key, *Pair.Value);
		}
	}
	for (const auto& Token : Tokens)
	{
		ExtraArgs += Token + TEXT(" ");
	}
	UJsRunHelper::CommandArgs = ExtraArgs.TrimEnd();

	{
		auto Loader = std::make_shared<puerts::DefaultJSModuleLoader>(TEXT("JavaScript"));
		Loader->AddSearchPath(FPaths::ProjectDir());

		puerts::FJsEnv JsEnv(
			Loader,
			std::make_shared<puerts::FDefaultLogger>(), -1);

		if (!JsEnv.Start(ModuleName))
		{
			UE_LOG(LogJsRunner, Error, TEXT("JsRunner: Failed to start module '%s'"), *ModuleName);
			return 1;
		}

		// Tick 循环：驱动 PuerTS 的 libuv 事件循环和 UE ticker，等待 JS 调用 MarkDone
		const double StartTime = FPlatformTime::Seconds();

		while (!UJsRunHelper::bDone)
		{
			// 处理 GameThread 任务队列（PuerTS 的 UvRunOnce 通过此机制调度）
			FTaskGraphInterface::Get().ProcessThreadUntilIdle(ENamedThreads::GameThread);

			// 处理 UE ticker 回调（setTimeout/setInterval 等）
			FTSTicker::GetCoreTicker().Tick(FApp::GetDeltaTime());

			FPlatformProcess::Sleep(0.01f);

			if (TimeoutSeconds > 0 && FPlatformTime::Seconds() - StartTime > TimeoutSeconds)
			{
				UE_LOG(LogJsRunner, Error, TEXT("JsRunner: Timed out after %.0f seconds"), TimeoutSeconds);
				return 1;
			}
		}
	}

	UE_LOG(LogJsRunner, Display, TEXT("JsRunner: Completed with exit code %d"), UJsRunHelper::ExitCode);
	return UJsRunHelper::ExitCode;
}
