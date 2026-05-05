#include "JsLogHelper.h"

DEFINE_LOG_CATEGORY(LogJs);

void UJsLogHelper::Log(const FString& Category, const FString& Message)
{
	if (Category.IsEmpty())
	{
		UE_LOG(LogJs, Log, TEXT("%s"), *Message);
		return;
	}
	UE_LOG(LogJs, Log, TEXT("[%s] %s"), *Category, *Message);
}

void UJsLogHelper::Info(const FString& Category, const FString& Message)
{
	if (Category.IsEmpty())
	{
		UE_LOG(LogJs, Display, TEXT("%s"), *Message);
		return;
	}
	UE_LOG(LogJs, Display, TEXT("[%s] %s"), *Category, *Message);
}

void UJsLogHelper::Warn(const FString& Category, const FString& Message)
{
	if (Category.IsEmpty())
	{
		UE_LOG(LogJs, Warning, TEXT("%s"), *Message);
		return;
	}
	UE_LOG(LogJs, Warning, TEXT("[%s] %s"), *Category, *Message);
}

void UJsLogHelper::Error(const FString& Category, const FString& Message)
{
	if (Category.IsEmpty())
	{
		UE_LOG(LogJs, Error, TEXT("%s"), *Message);
		return;
	}
	UE_LOG(LogJs, Error, TEXT("[%s] %s"), *Category, *Message);
}
