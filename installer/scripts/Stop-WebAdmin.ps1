<#
    Stop the web admin. The "Stop Web Admin" Start-menu shortcut.

    Plain, no confirmation -- unlike the counter app's exit, there is no queue of people waiting
    on this, and someone using the admin right now will simply see their next request fail rather
    than lose data mid-save. The database is never touched: DiningMySQL keeps running, because
    the counter app depends on it directly and always must.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
. "$PSScriptRoot\Dining-Common.ps1"

Add-Type -AssemblyName System.Windows.Forms

$svc = Get-Service -Name 'DiningWeb' -ErrorAction SilentlyContinue
if (-not $svc) {
    [System.Windows.Forms.MessageBox]::Show(
        'The DiningWeb service is not installed.', 'Dining Web Admin',
        [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning) | Out-Null
    exit 0
}

if ($svc.Status -eq 'Stopped') {
    Write-Ok 'Web admin was already stopped'
    exit 0
}

Write-Step 'Stopping the web admin'
Stop-Service 'DiningWeb' -Force
Write-Ok 'Web admin stopped (the counter is unaffected - it does not use this service)'
