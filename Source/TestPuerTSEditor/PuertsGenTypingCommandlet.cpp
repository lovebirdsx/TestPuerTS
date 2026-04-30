#include "PuertsGenTypingCommandlet.h"
#include "IDeclarationGenerator.h"
#include "CodeGenerator.h"

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

	// 遍历所有实现 ICodeGenerator 接口的类（如 ReactDeclarationGenerator），生成额外的类型声明
	for (TObjectIterator<UClass> It; It; ++It)
	{
		UClass* Class = *It;
		if (Class && Class->ImplementsInterface(UCodeGenerator::StaticClass()))
		{
			ICodeGenerator::Execute_Gen(Class->GetDefaultObject());
		}
	}

	UE_LOG(LogPuertsGenTyping, Display, TEXT("PuertsGenTyping: Completed"));
	return 0;
}
