#pragma once

#include "InputCoreTypes.h"
#include "Framework/Application/IInputProcessor.h"

class FEditorHelperInputProcessor : public IInputProcessor
{
public:
    // IInputProcessor interface
    virtual void Tick(const float DeltaTime, FSlateApplication &SlateApp, TSharedRef<ICursor> Cursor) override;
    virtual bool HandleKeyDownEvent(FSlateApplication &SlateApp, const FKeyEvent &InKeyEvent) override;
    // End of IInputProcessor interface
};
