using UnrealBuildTool;

public class EditorHelper : ModuleRules
{
    public EditorHelper(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[] {
            "Core"
        });

        PrivateDependencyModuleNames.AddRange(new string[] {
            "CoreUObject",
            "Engine",
            "InputCore",
            "Settings",
            "SlateCore",
            "Slate",
            "LevelEditor",
            "ContentBrowser",
            "AssetManagerEditor",
            "GameplayTagsEditor",
            "UnrealEd",
        });
    }
}