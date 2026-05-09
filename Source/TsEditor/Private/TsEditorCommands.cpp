#include "TsEditorCommands.h"

#define LOCTEXT_NAMESPACE "TsEditor"

void FTsEditorCommands::RegisterCommands()
{
	UI_COMMAND(Restart, "Restart", "Restart TsEditor JavaScript runtime", EUserInterfaceActionType::Button, FInputChord(EKeys::R, EModifierKey::Control | EModifierKey::Alt));
	UI_COMMAND(ToggleWaitJSDebug, "Wait JS Debugger", "Toggle waiting for JS debugger on next restart", EUserInterfaceActionType::ToggleButton, FInputChord());
	UI_COMMAND(OpenSettings, "Open Settings", "Open TsEditor plugin settings", EUserInterfaceActionType::Button, FInputChord());
}

#undef LOCTEXT_NAMESPACE
