#include "TsEditorCommands.h"

#define LOCTEXT_NAMESPACE "TsEditor"

void FTsEditorCommands::RegisterCommands()
{
	UI_COMMAND(Restart, "Restart", "Restart TsEditor JavaScript runtime", EUserInterfaceActionType::Button, FInputChord(EKeys::R, EModifierKey::Control | EModifierKey::Alt));
}

#undef LOCTEXT_NAMESPACE
