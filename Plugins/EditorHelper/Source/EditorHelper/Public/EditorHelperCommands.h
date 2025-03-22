#pragma once

#include "CoreMinimal.h"
#include "Framework/Commands/Commands.h"
#include "Framework/Commands/UICommandInfo.h"
#include "Styling/AppStyle.h"

class FEditorHelperCommands : public TCommands<FEditorHelperCommands>
{
public:
    FEditorHelperCommands()
        : TCommands<FEditorHelperCommands>(
              TEXT("EditorHelper"),
              NSLOCTEXT("Contexts", "EditorHelper", "Editor Helper"),
              NAME_None,
              FAppStyle::GetAppStyleSetName())
    {
    }

    TSharedPtr<FUICommandInfo> TestAction;

    virtual void RegisterCommands() override;
};
