# Tools/Setup/RegisterEngineAssociation.ps1

param(
    [string]$EngineRoot = $env:UE_MYPROJECT_ENGINE_ROOT
)

$AssociationName = "UE5.5-Souce"

if ([string]::IsNullOrWhiteSpace($EngineRoot)) {
    Write-Error "EngineRoot is required. Pass -EngineRoot or set UE_MYPROJECT_ENGINE_ROOT."
    exit 1
}

$EngineRoot = (Resolve-Path $EngineRoot).Path

if (!(Test-Path (Join-Path $EngineRoot "Engine\Binaries\Win64\UnrealEditor.exe"))) {
    Write-Error "Invalid UE5 engine root: $EngineRoot"
    exit 1
}

$RegPath = "HKCU:\Software\Epic Games\Unreal Engine\Builds"

New-Item -Path $RegPath -Force | Out-Null

New-ItemProperty `
    -Path $RegPath `
    -Name $AssociationName `
    -Value $EngineRoot `
    -PropertyType String `
    -Force | Out-Null

Write-Host "Registered:"
Write-Host "  $AssociationName -> $EngineRoot"
