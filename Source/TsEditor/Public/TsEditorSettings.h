// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DeveloperSettings.h"
#include "TsEditorSettings.generated.h"

/**
 * 
 */
UCLASS(config = Editor, defaultconfig, meta = (DisplayName = "TsEditor Settings"))
class TSEDITOR_API UTsEditorSettings : public UDeveloperSettings
{
	GENERATED_BODY()

public:
	UTsEditorSettings();

	// 启动脚本
	UPROPERTY(EditAnywhere, config, Category = "Ts Editor Settings", meta = (DisplayName = "Module Name"))
	FString ModuleName;

	// 调试的端口
	UPROPERTY(EditAnywhere, config, Category = "Ts Editor Settings", meta = (DisplayName = "Debug Port"))
	int DebugPort;

	// 是否等待调试器
	UPROPERTY(EditAnywhere, config, Category = "Ts Editor Settings", meta = (DisplayName = "Wait JS Debug"))
	bool bWaitJSDebug;
};
