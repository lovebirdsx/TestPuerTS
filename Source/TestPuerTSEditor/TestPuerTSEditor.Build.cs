// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class TestPuerTSEditor : ModuleRules
{
    public TestPuerTSEditor(ReadOnlyTargetRules Target) : base(Target)
    {
        PrivateDependencyModuleNames.AddRange(new string[]
        {
            "LiveCoding",
            "SessionFrontend",
            "JsEnv"
        });
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "InputCore",
            "EnhancedInput",
            "GameplayAbilities",
            "GameplayTags",
            "GameplayTasks",
            "DataRegistry",
            "UnrealEd",
            "DeveloperSettings",
            "CQTest",            
            "TestPuerTS",
        });
    }
}
