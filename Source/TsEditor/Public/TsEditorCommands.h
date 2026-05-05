#pragma once

#include "CoreMinimal.h"
#include "Framework/Commands/Commands.h"
#include "Framework/Commands/UICommandInfo.h"
#include "Styling/AppStyle.h"

class FTsEditorCommands : public TCommands<FTsEditorCommands>
{
public:
	FTsEditorCommands()
		: TCommands<FTsEditorCommands>(
			  TEXT("TsEditor"),
			  NSLOCTEXT("Contexts", "TsEditor", "TsEditor"),
			  NAME_None,
			  FAppStyle::GetAppStyleSetName())
	{
	}

	TSharedPtr<FUICommandInfo> Restart;
	TSharedPtr<FUICommandInfo> ToggleWaitJSDebug;

	virtual void RegisterCommands() override;
};
