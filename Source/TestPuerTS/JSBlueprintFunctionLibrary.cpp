// Fill out your copyright notice in the Description page of Project Settings.

#include "JSBlueprintFunctionLibrary.h"

FString UJSBlueprintFunctionLibrary::GetName()
{
	return TEXT("Hello");
}

FString UJSBlueprintFunctionLibrary::Hello(FString To)
{
    FString Result = FString::Printf(TEXT("Hello %s"), *(To));
    return Result;
}

FString UJSBlueprintFunctionLibrary::Concat(FString First, FString Second)
{
	return First + Second;
}

void UJSBlueprintFunctionLibrary::Info(UClass* To)
{	
}

