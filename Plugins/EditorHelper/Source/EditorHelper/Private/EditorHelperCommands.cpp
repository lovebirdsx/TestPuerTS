#include "EditorHelperCommands.h"

#define LOCTEXT_NAMESPACE "EditorHelper"

void FEditorHelperCommands::RegisterCommands()
{
    UI_COMMAND(TestAction, "Test Action", "Test Action", EUserInterfaceActionType::Button, FInputChord(EKeys::T, EModifierKey::Control));
}

#undef LOCTEXT_NAMESPACE
