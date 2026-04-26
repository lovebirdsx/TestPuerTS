#include "PuertsTestCommandlet.h"
#include "JsEnv.h"

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

	UE_LOG(LogPuertsTest, Display, TEXT("PuertsTest: Running module '%s'"), *ModuleName);

	{
		puerts::FJsEnv JsEnv(
			std::make_shared<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")),
			std::make_shared<puerts::FDefaultLogger>(), -1);

		JsEnv.Start(ModuleName);
	}

	UE_LOG(LogPuertsTest, Display, TEXT("PuertsTest: Completed"));
	return 0;
}
