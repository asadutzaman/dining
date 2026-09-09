<#
    Build dining-setup.exe end to end.

        powershell -ExecutionPolicy Bypass -File build-installer.ps1

    Stages: fetch runtimes -> stage payload -> verify -> compile with Inno Setup.

    The verify step is not optional and cannot be skipped from here. Every check it makes catches
    something that is invisible at build time and expensive at the counter.
#>
[CmdletBinding()]
param(
    [string] $RepoRoot,
    [string] $Version = '1.0.0',
    [string] $LaragonRoot = 'C:\laragon',
    [switch] $SkipFetch,
    [switch] $SkipStage,
    [switch] $SkipMigrationCheck
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
. "$PSScriptRoot\scripts\Dining-Common.ps1"

if (-not $RepoRoot) { $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }

$stage = Join-Path $PSScriptRoot 'stage'
$out   = Join-Path $PSScriptRoot 'out'
New-Item -ItemType Directory -Force -Path $out | Out-Null

# ---------------------------------------------------------------- prerequisites
Write-Step 'Checking build prerequisites'

$iscc = $null
foreach ($candidate in @(
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "$env:ProgramFiles\Inno Setup 6\ISCC.exe")) {
    if (Test-Path $candidate) { $iscc = $candidate; break }
}
if (-not $iscc) {
    $cmd = Get-Command 'ISCC.exe' -ErrorAction SilentlyContinue
    if ($cmd) { $iscc = $cmd.Source }
}
if (-not $iscc) {
    throw @'
Inno Setup 6 is not installed. Install it and run this again:

    winget install JRSoftware.InnoSetup

(or download from https://jrsoftware.org/isdl.php)
'@
}
Write-Ok "Inno Setup: $iscc"

foreach ($tool in 'composer', 'node', 'yarn', 'php', 'python') {
    $cmd = Get-Command $tool -ErrorAction SilentlyContinue
    if (-not $cmd) { throw "$tool is not on PATH; the payload cannot be built without it." }
    Write-Ok "$tool : $($cmd.Source)"
}

# The counter is built with whatever python is on PATH. If it lacks PySide6 the build will
# install it, which works but is not necessarily the toolchain the known-good build came from.
& python -c "import PySide6" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Warn 'The python on PATH has no PySide6. build.ps1 will install it, but consider pointing PATH at the interpreter your working build uses.'
}

# ---------------------------------------------------------------- pipeline
if (-not $SkipFetch) {
    & "$PSScriptRoot\fetch-runtimes.ps1" -LaragonRoot $LaragonRoot
    if ($LASTEXITCODE -ne 0) { throw 'fetch-runtimes.ps1 failed' }
} else {
    Write-Warn 'Skipping runtime fetch (-SkipFetch)'
}

if (-not $SkipStage) {
    $stageArgs = @{ RepoRoot = $RepoRoot }
    if ($SkipMigrationCheck) { $stageArgs['SkipMigrationCheck'] = $true }
    & "$PSScriptRoot\stage-payload.ps1" @stageArgs
    if ($LASTEXITCODE -ne 0) { throw 'stage-payload.ps1 failed' }
} else {
    Write-Warn 'Skipping payload staging (-SkipStage)'
}

# Always. This is the gate.
& "$PSScriptRoot\verify-stage.ps1" -StagePath $stage -RepoRoot $RepoRoot
if ($LASTEXITCODE -ne 0) { throw 'verify-stage.ps1 failed' }

# ---------------------------------------------------------------- compile
Write-Step "Compiling dining-setup.exe (version $Version)"
Invoke-Native -FilePath $iscc -Arguments @(
    "/DStageDir=$stage",
    "/DOutDir=$out",
    "/DAppVersion=$Version",
    (Join-Path $PSScriptRoot 'dining.iss')
)

$exe = Join-Path $out 'dining-setup.exe'
if (-not (Test-Path $exe)) { throw "Inno Setup reported success but $exe does not exist." }

$mb = [math]::Round((Get-Item $exe).Length / 1MB, 1)
Write-Ok "Built $exe ($mb MB)"
Write-Host ''
Write-Host 'To deploy:' -ForegroundColor Gray
Write-Host '  1. Copy dining-setup.exe to the counter PC.' -ForegroundColor Gray
Write-Host '  2. To restore existing members and balances, put dining-full.sql BESIDE it.' -ForegroundColor Gray
Write-Host '     Without that file the installer creates an empty database instead.' -ForegroundColor Gray
Write-Host '  3. Right-click, Run as administrator.' -ForegroundColor Gray
