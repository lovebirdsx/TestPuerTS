#include "EditorIconHelper.h"
#include "Styling/AppStyle.h"

FSlateBrush UEditorIconHelper::GetEditorIcon(FName IconName)
{
    if (IconName.IsNone())
    {
        return FSlateBrush();
    }
    const FSlateBrush* Source = FAppStyle::Get().GetBrush(IconName);
    if (Source == nullptr)
    {
        return FSlateBrush();
    }
    return *Source;
}
