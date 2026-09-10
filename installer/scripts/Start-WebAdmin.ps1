<#
    Start the web admin and open it in the browser.

    This is the "Dining Web Admin" desktop shortcut. Apache is registered start= demand (see
    Install-Services.ps1), so the service is normally stopped and this is the only thing that
    starts it. It exists because opening a plain http://localhost:8000/ shortcut against a
    stopped service just shows the operator a connection-refused page and teaches them the
    feature is broken.

    Deliberately does not stop the service when done -- see Stop-WebAdmin.ps1 for that. Being
    asked to close the browser tab should not also drop someone else's half-finished form.
#>
[CmdletBinding()]
param(
    [string] $InstallRoot = 'C:\dining'
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\Dining-Common.ps1"

$conf = Join-Path $InstallRoot 'config\httpd.conf'
$errorLog = 'C:\ProgramData\Dining\logs\apache-error.log'

function Get-ConfiguredWebPort {
    # Read the port back from the rendered config rather than hardcoding it, so this keeps
    # working if the port is ever changed by re-running the installer or editing httpd.conf.
    if (-not (Test-Path $conf)) {
        throw "Apache configuration not found at $conf. Is the dining system installed?"
    }
    $line = Select-String -Path $conf -Pattern '^\s*Listen\s+(?:127\.0\.0\.1:)?(\d+)\s*$' | Select-Object -First 1
    if (-not $line) { throw "Could not find a Listen directive in $conf" }
    return [int]$line.Matches[0].Groups[1].Value
}

function Show-Failure {
    param([string] $Message)
    Write-Fail $Message
    $tail = ''
    if (Test-Path $errorLog) {
        $tail = "`n`nLast lines of apache-error.log:`n" + ((Get-Content $errorLog -Tail 15) -join "`n")
    }
    [System.Windows.Forms.MessageBox]::Show(
        "$Message$tail",
        'Dining Web Admin',
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error) | Out-Null
}

Add-Type -AssemblyName System.Windows.Forms

$port = Get-ConfiguredWebPort

$svc = Get-Service -Name 'DiningWeb' -ErrorAction SilentlyContinue
if (-not $svc) {
    Show-Failure 'The DiningWeb service is not installed. Re-run the installer.'
    exit 1
}

if ($svc.Status -ne 'Running') {
    Write-Step 'Starting the web admin'
    try {
        Start-Service 'DiningWeb'
    } catch {
        Show-Failure "Could not start the web admin service: $($_.Exception.Message)"
        exit 1
    }
}

# Poll rather than trust Start-Service returning: the service can report Running before Apache
# has finished binding the port, and opening the browser one beat too early is exactly the
# connection-refused flash this script exists to avoid.
Write-Step 'Waiting for it to respond'
$ready = $false
foreach ($attempt in 1..20) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/app-version" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {
        Start-Sleep -Milliseconds 500
    }
}

if (-not $ready) {
    Show-Failure "The web admin did not respond on port $port within 10 seconds."
    exit 1
}

Write-Ok 'Web admin is up'
Start-Process "http://localhost:$port/"
