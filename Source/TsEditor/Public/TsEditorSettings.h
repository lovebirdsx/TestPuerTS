// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Settings/EditorSettings.h"
#include "TsEditorSettings.generated.h"

/**
 * 
 */
UCLASS(config=EditorSave, defaultconfig, meta = (DisplayName = "TsEditor"))
class TSEDITOR_API UTsEditorSettings : public UEditorSettings
{
	GENERATED_BODY()

public:
	DECLARE_MULTICAST_DELEGATE_OneParam(FOnPropertyChanged, FString);
	
	UTsEditorSettings();
	
	FOnPropertyChanged OnPropertyChanged;

	// 启动脚本
	UPROPERTY(EditAnywhere, config, Category = "Ts Editor", meta = (DisplayName = "Module Name"))
	FString ModuleName;

	// 调试的端口
	UPROPERTY(EditAnywhere, config, Category = "Ts Editor", meta = (DisplayName = "Debug Port"))
	int DebugPort;

	// 是否等待调试器
	UPROPERTY(EditAnywhere, config, Category = "Ts Editor", meta = (DisplayName = "Wait JS Debug"))
	bool bWaitJSDebug;

	// 是否自动运行单元测试
	UPROPERTY(EditAnywhere, config, Category = "Ts Editor", meta = (DisplayName = "Auto Run Unit Tests"))
	bool bAutoRunUnitTests;

private:
	virtual void PostEditChangeProperty(struct FPropertyChangedEvent& PropertyChangedEvent) override;
};
