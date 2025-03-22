// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "UObject/Object.h"
#include "JsEnv.h"
#include "TsEditor.generated.h"

class FLoggerForJs;

UCLASS(BlueprintType)
class TSEDITOR_API UTsEditor: public  UObject
{
	GENERATED_BODY()
public:
	UTsEditor();	
	
	DECLARE_DYNAMIC_MULTICAST_DELEGATE(FEvent0);
	DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FLogEvent, FString, Value);	

	UFUNCTION(BlueprintCallable, Category = "TsEditor")
	void Start();

	UFUNCTION(BlueprintCallable, Category = "TsEditor")
	void Stop();
	
	UFUNCTION(BlueprintCallable, Category = "TsEditor")
	void Restart();

	UFUNCTION(BlueprintCallable, Category = "TsEditor")
	bool IsRunning();	

	UFUNCTION(BlueprintCallable, Category = "TsEditor")
	FString CurrentStackTrace();

	UPROPERTY(EditAnywhere, BlueprintAssignable, Category="TsEditor", meta=( IsBindableEvent="True" ))
	FEvent0 OnStarted;

	UPROPERTY(EditAnywhere, BlueprintAssignable, Category="TsEditor", meta=( IsBindableEvent="True" ))
	FEvent0 OnStopped;

	UPROPERTY(EditAnywhere, BlueprintAssignable, Category="TsEditor", meta=( IsBindableEvent="True" ))
	FLogEvent OnLogError;	

	UPROPERTY(EditAnywhere, Category = "TsEditor")
	bool bWaitJSDebug;

	UPROPERTY(EditAnywhere, Category = "TsEditor")
	FString ModuleName;

	UPROPERTY(EditAnywhere, Category = "TsEditor")
	int DebugPort;
	
private:
	friend class FLoggerForJs;

	bool bIsRestarting = false;

	TSharedPtr<puerts::FJsEnv> JsEnv;			

	void FireLogErrorEvent(const FString& Message);
};
