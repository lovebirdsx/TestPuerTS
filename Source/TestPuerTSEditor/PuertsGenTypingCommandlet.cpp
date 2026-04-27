#include "PuertsGenTypingCommandlet.h"
#include "IDeclarationGenerator.h"

DEFINE_LOG_CATEGORY_STATIC(LogPuertsGenTyping, Log, All);

UPuertsGenTypingCommandlet::UPuertsGenTypingCommandlet()
{
	IsClient = false;
	IsEditor = true;
	IsServer = false;
	LogToConsole = true;
}

int32 UPuertsGenTypingCommandlet::Main(const FString& Params)
{
	bool bGenFull = false;
	FName SearchPath = NAME_None;

	TArray<FString> Tokens;
	TArray<FString> Switches;
	TMap<FString, FString> ParamMap;
	ParseCommandLine(*Params, Tokens, Switches, ParamMap);

	if (Switches.Contains(TEXT("FULL")))
	{
		bGenFull = true;
	}
	if (ParamMap.Contains(TEXT("path")))
	{
		SearchPath = *ParamMap[TEXT("path")];
	}

	UE_LOG(LogPuertsGenTyping, Display, TEXT("PuertsGenTyping: Generating typings (Full=%s)"), bGenFull ? TEXT("true") : TEXT("false"));

	IDeclarationGenerator::Get().GenTypeScriptDeclaration(bGenFull, SearchPath);

	UE_LOG(LogPuertsGenTyping, Display, TEXT("PuertsGenTyping: Completed"));
	return 0;
}
