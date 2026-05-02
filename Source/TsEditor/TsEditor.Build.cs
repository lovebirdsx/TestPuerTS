using UnrealBuildTool;

public class TsEditor : ModuleRules
{
    public TsEditor(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(
            new string[]
            {
                "Core",
            }
        );

        PrivateDependencyModuleNames.AddRange(
            new string[]
            {
                "CoreUObject",
                "Engine",
                "Slate",
                "SlateCore",
                "InputCore",
                "DeveloperSettings",
                "UnrealEd",
                "LevelEditor",
                "Blutility",
                "UMG",
                "ToolMenus",
                "JsEnv",
                "EditorCommon",
            }
        );
    }
}
