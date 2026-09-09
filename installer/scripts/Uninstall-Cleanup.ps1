<#
    Reverse everything the installer registered, and PRESERVE everything that holds data.

    Runs before Inno deletes {app}, because it needs the binaries it is about to remove.

    WHAT IS KEPT, and why it must stay kept:
      C:\ProgramData\Dining\mysql    the database. Member balances are a running total that
                                     nothing else can reconstruct - there is no ledger. Deleting
                                     this loses every member's outstanding due, permanently.
      C:\ProgramData\Dining\backup   the nightly dumps.
      C:\ProgramData\Dining\uploads  member photos, which the deployment notes record as being
                                     difficult to obtain at all.
      C:\ProgramData\Dining\logs     the audit trail.

    The .iss must NOT carry a catch-all [UninstallDelete] for {app}; Inno removes only what it
    installed, and a sweeping rule is exactly what would take a data directory with it if anyone
    ever relocates one back under {app}.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $InstallRoot,
    [string] $DataRoot = 'C:\ProgramData\Dining',
    [string] $DbName   = 'dining',
    [switch] $SkipSafetyDump
)

# Never abort halfway through a teardown: a half-removed service is worse than a failed step.
$ErrorActionPreference = 'Continue'
. "$PSScriptRoot\Dining-Common.ps1"

Write-Step 'Uninstalling the dining system'

# --------------------------------------------------------------- safety dump first
# Before anything is torn down, while the database is still running.
if (-not $SkipSafetyDump) {
    $mysqldump = Join-Path $InstallRoot 'runtime\mysql\bin\mysqldump.exe'
    $myIni     = Join-Path $InstallRoot 'config\my.ini'
    $backupDir = Join-Path $DataRoot 'backup'

    if ((Test-Path $mysqldump) -and (Get-Service 'DiningMySQL' -ErrorAction SilentlyContinue)) {
        try {
            New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
            $stamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
            $out = Join-Path $backupDir "pre-uninstall-$stamp.sql"
            Write-Step 'Taking a safety dump before removing anything'
            & $mysqldump "--defaults-file=$myIni" -u root --single-transaction --routines --events `
                --default-character-set=utf8mb4 $DbName | Out-File -FilePath $out -Encoding utf8
            if ((Test-Path $out) -and ((Get-Item $out).Length -gt 10240)) {
                Write-Ok "Safety dump: $out ($([math]::Round((Get-Item $out).Length / 1KB))KB)"
            } else {
                Write-Warn 'Safety dump looks too small to be real - continuing, but the data directory is being kept regardless.'
            }
        } catch {
            Write-Warn "Safety dump failed: $($_.Exception.Message). The data directory is kept, so nothing is lost."
        }
    }
}

# --------------------------------------------------------------- web service
if (Get-Service 'DiningWeb' -ErrorAction SilentlyContinue) {
    Write-Step 'Removing the DiningWeb service'
    Stop-Service 'DiningWeb' -Force -ErrorAction SilentlyContinue
    $httpd = Join-Path $InstallRoot 'runtime\apache\bin\httpd.exe'
    if (Test-Path $httpd) { & $httpd -k uninstall -n DiningWeb 2>&1 | Out-Null }
    else { & sc.exe delete DiningWeb 2>&1 | Out-Null }
    Write-Ok 'DiningWeb removed'
}

# --------------------------------------------------------------- database service
if (Get-Service 'DiningMySQL' -ErrorAction SilentlyContinue) {
    Write-Step 'Stopping the database'
    Stop-Service 'DiningMySQL' -Force -ErrorAction SilentlyContinue

    # Wait for a clean InnoDB shutdown. Killing mysqld with a warm buffer pool is how a data
    # directory gets corrupted, and this one is being deliberately preserved.
    $deadline = (Get-Date).AddSeconds(60)
    while ((Get-Date) -lt $deadline) {
        $svc = Get-Service 'DiningMySQL' -ErrorAction SilentlyContinue
        if (-not $svc -or $svc.Status -eq 'Stopped') { break }
        Start-Sleep -Seconds 2
    }
    $svc = Get-Service 'DiningMySQL' -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -ne 'Stopped') {
        Write-Warn 'The database did not stop within 60s. NOT forcing it - the service is left in place so the data directory stays intact. Reboot and uninstall again.'
    } else {
        $mysqld = Join-Path $InstallRoot 'runtime\mysql\bin\mysqld.exe'
        if (Test-Path $mysqld) { & $mysqld --remove DiningMySQL 2>&1 | Out-Null }
        else { & sc.exe delete DiningMySQL 2>&1 | Out-Null }
        Write-Ok 'DiningMySQL removed (data directory kept)'
    }
}

# --------------------------------------------------------------- scheduled task
Write-Step 'Removing the backup schedule'
& schtasks.exe /Delete /TN 'Dining DB backup' /F 2>&1 | Out-Null
Write-Ok 'Scheduled task removed (existing dumps kept)'

# --------------------------------------------------------------- firewall
Write-Step 'Removing the firewall rule'
Get-NetFirewallRule -Group 'Dining' -ErrorAction SilentlyContinue |
    Remove-NetFirewallRule -ErrorAction SilentlyContinue

# --------------------------------------------------------------- uploads junction
# rmdir on a junction removes the LINK, never the target. Do this before Inno deletes {app},
# otherwise a recursive delete could follow it into the real photo folder.
$junction = Join-Path $InstallRoot 'backend\storage\app\public\uploads'
if (Test-Path $junction) {
    $item = Get-Item $junction -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
        Write-Step 'Removing the uploads junction (photos themselves are kept)'
        & cmd.exe /c rmdir "`"$junction`"" 2>&1 | Out-Null
    }
}

Write-Ok 'Uninstall finished'
Write-Host ''
Write-Host "Your data has been KEPT at $DataRoot" -ForegroundColor Yellow
Write-Host '  mysql\   the database (member balances)' -ForegroundColor Yellow
Write-Host '  backup\  nightly dumps, including a fresh pre-uninstall one' -ForegroundColor Yellow
Write-Host '  uploads\ member photos' -ForegroundColor Yellow
Write-Host 'Delete that folder by hand only when you are certain you no longer need any of it.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Power settings and Windows Update active hours were left as they are.' -ForegroundColor Gray
