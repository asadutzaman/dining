<#
    Register the nightly database backup as a scheduled task, then prove it actually works.

    Registered from XML rather than schtasks /SC DAILY flags, because the settings that matter
    are only reachable through XML - in particular DisallowStartIfOnBatteries and
    StopIfGoingOnBatteries, which both default to true and would silently skip every backup on a
    UPS-backed PC that reports as running on battery.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $InstallRoot,
    [Parameter(Mandatory)] [string] $DataRoot,
    [string] $TaskName = 'Dining DB backup',
    [switch] $SkipVerify
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\Dining-Common.ps1"

$xmlPath   = Join-Path $InstallRoot 'tools\dining-backup.task.xml'
$backupCmd = Join-Path $InstallRoot 'tools\backup.cmd'
$backupDir = Join-Path $DataRoot 'backup'

if (-not (Test-Path $xmlPath))   { throw "Task definition not found: $xmlPath" }
if (-not (Test-Path $backupCmd)) { throw "Backup script not found: $backupCmd" }

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# schtasks /XML wants a UTF-16 file; the template is rendered as UTF-8 (no BOM) like every other
# template, so convert here rather than making Expand-Template special-case one caller.
$unicodeXml = Join-Path $env:TEMP 'dining-backup.task.unicode.xml'
[System.IO.File]::WriteAllText($unicodeXml, [System.IO.File]::ReadAllText($xmlPath), [System.Text.Encoding]::Unicode)

Write-Step "Registering the scheduled task '$TaskName'"
Invoke-Native -FilePath 'schtasks.exe' -Arguments @('/Create', '/TN', $TaskName, '/XML', $unicodeXml, '/F')
Remove-Item $unicodeXml -Force -ErrorAction SilentlyContinue
Write-Ok 'Task registered (daily, runs as SYSTEM, catches up if the PC was off)'

if ($SkipVerify) { return }

# Run it once now. A backup job that has never produced a file is not a backup - and the usual
# causes (a wrong mysqldump path, a password mismatch) only show up when it actually runs.
Write-Step 'Running the backup once to prove it works'
$before = @(Get-ChildItem $backupDir -Filter 'dining-*.sql' -ErrorAction SilentlyContinue).Count
Invoke-Native -FilePath 'schtasks.exe' -Arguments @('/Run', '/TN', $TaskName)

$deadline = (Get-Date).AddSeconds(120)
$newest = $null
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    $files = @(Get-ChildItem $backupDir -Filter 'dining-*.sql' -ErrorAction SilentlyContinue |
               Sort-Object LastWriteTime -Descending)
    if ($files.Count -gt $before) { $newest = $files[0]; break }
}

if (-not $newest) {
    Write-Warn "The backup task did not produce a dump within 2 minutes. Check $DataRoot\logs\backup.log."
    return
}

$kb = [math]::Round($newest.Length / 1KB)
if ($newest.Length -lt 10240) {
    Write-Warn "Backup ran but the dump is only ${kb}KB - that is almost certainly an error header, not data. Check $DataRoot\logs\backup.log."
} else {
    Write-Ok "Backup verified: $($newest.Name) (${kb}KB)"
}

Write-Warn 'A backup on the same disk as the database is not a backup. Copy these off the machine periodically.'
