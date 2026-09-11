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

# Log to a build-local file, not the real install-time path. Dining-Common.ps1 defaults
# DINING_LOG to C:\ProgramData\Dining\logs\install.log, which is correct for the scripts an
# actual install runs -- but this script runs on a DEV machine, and writing build output there
# is exactly what created a misleading "install.log" on a machine where Dining Counter had
# never been installed, confusing later diagnosis of an unrelated service-name collision.
if (-not $env:DINING_LOG) { $env:DINING_LOG = Join-Path $PSScriptRoot 'out\build.log' }
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
    "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
    # winget's per-user install target (no admin rights needed) - this is where it lands when
    # the machine-wide Program Files location above is not used.
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe")) {
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
#
# Deliberately NOT redirecting stderr here (no "2>&1", no "2>$null"). In Windows PowerShell 5.1,
# redirecting a native command's stderr wraps each line in a NativeCommandError, and with
# $ErrorActionPreference = 'Stop' that is a terminating error regardless of where the redirect
# sends it - which would abort this whole build over what is meant to be a non-fatal warning.
# stderr is left to print straight to the console (a Python traceback, if PySide6 is missing);
# only the exit code is checked.
$null = & python -c "import PySide6"
if ($LASTEXITCODE -ne 0) {
    Write-Warn 'The python on PATH has no PySide6 (see the traceback above). build.ps1 will install it, but consider pointing PATH at the interpreter your working build uses.'
}

# ---------------------------------------------------------------- pipeline
#
# No "if ($LASTEXITCODE -ne 0) { throw ... }" after any of these three. A .ps1 script does not
# reset $LASTEXITCODE the way a native exe does, so a check like that reads whatever native
# command happened to run last - anywhere earlier in the whole call chain, including inside the
# sub-script itself if it called mysql.exe or php.exe as its own final step. Caught directly:
# fetch-runtimes.ps1 completed successfully ("Runtimes staged...") and this build still aborted
# with "fetch-runtimes.ps1 failed", because $LASTEXITCODE was still 1 from the earlier PySide6
# probe above. Each of these scripts sets $ErrorActionPreference = 'Stop' and throws on a real
# failure, and that propagates through the & call as a genuine terminating error on its own -
# nothing more is needed here to stop the build on a real problem.
if (-not $SkipFetch) {
    & "$PSScriptRoot\fetch-runtimes.ps1" -LaragonRoot $LaragonRoot
} else {
    Write-Warn 'Skipping runtime fetch (-SkipFetch)'
}

if (-not $SkipStage) {
    $stageArgs = @{ RepoRoot = $RepoRoot }
    if ($SkipMigrationCheck) { $stageArgs['SkipMigrationCheck'] = $true }
    & "$PSScriptRoot\stage-payload.ps1" @stageArgs
} else {
    Write-Warn 'Skipping payload staging (-SkipStage)'
}

# Always. This is the gate.
& "$PSScriptRoot\verify-stage.ps1" -StagePath $stage -RepoRoot $RepoRoot

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
