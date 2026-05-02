#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "TsEditorMenuLibrary.generated.h"

DECLARE_DYNAMIC_DELEGATE_OneParam(FTsEditorMenuExecute, FName, Id);
DECLARE_DYNAMIC_DELEGATE_RetVal_OneParam(bool, FTsEditorMenuCanExecute, FName, Id);

USTRUCT(BlueprintType)
struct TSEDITOR_API FTsEditorMenuEntryConfig
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	FName Id;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	FName Owner = TEXT("TsEditorJS");

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	TArray<FString> Path;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	FName Section = TEXT("Dynamic");

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	FString Label;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	FString ToolTip;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	int32 SortOrder = 0;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "TsEditor|Menu")
	bool bCloseAfterSelection = true;
};

UCLASS()
class TSEDITOR_API UTsEditorMenuLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()

public:
	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "TsEditor|Menu")
	static bool RegisterMenuEntry(
		const FTsEditorMenuEntryConfig& Config,
		FTsEditorMenuExecute Execute,
		FTsEditorMenuCanExecute CanExecute);

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "TsEditor|Menu")
	static bool UnregisterMenuEntry(FName Id);

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "TsEditor|Menu")
	static int32 UnregisterMenuEntriesByOwner(FName Owner);

	UFUNCTION(BlueprintCallable, BlueprintCosmetic, Category = "TsEditor|Menu")
	static void RefreshMenus();
};
