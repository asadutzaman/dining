<#
    Shared helpers for the build scripts and the install-time scripts.

    Dot-source it:  . "$PSScriptRoot\Dining-Common.ps1"
#>

# No Set-StrictMode here on purpose. This file is dot-sourced, so any strict mode it sets leaks
# into the caller's whole session -- including code it knows nothing about -- and turns ordinary
# things like reading an unset $LASTEXITCODE into a terminating error. Scripts that want strict
# mode should set it themselves.

$script:DiningLogFile = $env:DINING_LOG
if (-not $script:DiningLogFile) {
    $script:DiningLogFile = 'C:\ProgramData\Dining\logs\install.log'
}

function Write-DiningLog {
    param([string] $Message, [string] $Level = 'INFO')

    $line = '{0} {1} {2}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level.PadRight(5), $Message
    try {
        $dir = Split-Path $script:DiningLogFile -Parent
        if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
        Add-Content -Path $script:DiningLogFile -Value $line -Encoding utf8
    } catch {
        # Logging must never be the thing that fails an install.
    }
}

function Write-Step { param([string] $Message)
    Write-Host "==> $Message" -ForegroundColor Cyan; Write-DiningLog $Message }

function Write-Ok { param([string] $Message)
    Write-Host "    $Message" -ForegroundColor Green; Write-DiningLog $Message }

function Write-Warn { param([string] $Message)
    Write-Host "    WARNING: $Message" -ForegroundColor Yellow; Write-DiningLog $Message 'WARN' }

function Write-Fail { param([string] $Message)
    Write-Host "    ERROR: $Message" -ForegroundColor Red; Write-DiningLog $Message 'ERROR' }

<#
    Run a native executable and throw if it fails.

    PowerShell does not raise on a non-zero exit code from a native process, so without this
    every step would appear to succeed and the failure would only surface much later as a
    puzzling symptom. 2>&1 is deliberately NOT used: on Windows PowerShell 5.1 it wraps each
    stderr line from a native exe in an ErrorRecord and can make a successful command look failed.
#>
function Invoke-Native {
    param(
        [Parameter(Mandatory)] [string] $FilePath,
        [string[]] $Arguments = @(),
        [string] $WorkingDirectory,
        [int[]] $AllowExitCodes = @(0),
        [switch] $PassThru
    )

    $display = "$FilePath $($Arguments -join ' ')"
    Write-DiningLog "run: $display"

    $pushed = $false
    if ($WorkingDirectory) { Push-Location $WorkingDirectory; $pushed = $true }
    try {
        $output = & $FilePath @Arguments
        $code = $LASTEXITCODE
    } finally {
        if ($pushed) { Pop-Location }
    }

    if ($AllowExitCodes -notcontains $code) {
        $tail = ($output | Select-Object -Last 20) -join "`n"
        Write-DiningLog "exit $code from: $display`n$tail" 'ERROR'
        throw "Command failed (exit $code): $display`n$tail"
    }
    if ($PassThru) { return $output }
}

<#
    Render a template, replacing {{TOKEN}} placeholders.

    Written without a BOM on purpose. configparser (the counter app's config.ini) and MySQL's
    my.ini parser both treat a leading BOM as content, which produces errors that point at a
    line that looks perfectly correct.
#>
function Expand-Template {
    param(
        [Parameter(Mandatory)] [string] $TemplatePath,
        [Parameter(Mandatory)] [string] $Destination,
        [Parameter(Mandatory)] [hashtable] $Values
    )

    if (-not (Test-Path $TemplatePath)) { throw "Template not found: $TemplatePath" }
    $text = Get-Content $TemplatePath -Raw -Encoding UTF8

    foreach ($key in $Values.Keys) {
        $text = $text.Replace("{{$key}}", [string]$Values[$key])
    }

    $leftover = [regex]::Matches($text, '\{\{([A-Z0-9_]+)\}\}') |
                ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    if ($leftover) {
        throw "Template $TemplatePath still has unreplaced placeholders: $($leftover -join ', ')"
    }

    $dir = Split-Path $Destination -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText($Destination, $text, (New-Object System.Text.UTF8Encoding($false)))
    Write-DiningLog "wrote $Destination"
}

<#
    Wait for MySQL to accept connections.

    A freshly registered service reports Running long before InnoDB has finished recovery, so
    the very next mysql.exe call races it. On timeout the error log is surfaced, because
    "installation failed" with no reason is the least useful thing an installer can say.
#>
function Wait-ForMySql {
    param(
        [Parameter(Mandatory)] [string] $MysqlAdmin,
        [Parameter(Mandatory)] [string] $DefaultsFile,
        [string] $User = 'root',
        [string] $Password = '',
        [int] $TimeoutSeconds = 90,
        [string] $ErrorLog
    )

    Write-DiningLog "waiting for MySQL (timeout ${TimeoutSeconds}s)"
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        $args = @("--defaults-file=$DefaultsFile", "-u$User")
        if ($Password) { $args += "-p$Password" }
        $args += 'ping'

        # No "2>$null" here. In Windows PowerShell 5.1, redirecting a native command's stderr --
        # even to $null -- wraps it in a NativeCommandError, and under the caller's
        # $ErrorActionPreference = 'Stop' that is TERMINATING. mysqladmin writes to stderr on
        # every failed ping, which is the expected state on essentially every real install
        # (MySQL is not instantly ready right after --initialize-insecure and service start), so
        # this loop would throw on its very first iteration instead of polling and retrying --
        # breaking the installer at the one step every install depends on. Caught directly:
        # calling mysqladmin against a closed port under Stop threw immediately with the old
        # redirect and did not with this version. stderr is left to print to the (hidden,
        # runhidden-flagged) console; only the exit code is checked.
        $null = & $MysqlAdmin @args
        if ($LASTEXITCODE -eq 0) {
            Write-Ok 'MySQL is accepting connections'
            return $true
        }
        Start-Sleep -Seconds 2
    }

    $detail = ''
    if ($ErrorLog -and (Test-Path $ErrorLog)) {
        $detail = "`nLast lines of $ErrorLog`:`n" + ((Get-Content $ErrorLog -Tail 20) -join "`n")
    }
    throw "MySQL did not accept connections within ${TimeoutSeconds}s.$detail"
}

function Test-PortFree {
    param([Parameter(Mandatory)] [int] $Port)
    $inUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return (-not $inUse)
}

function Get-PortOwner {
    param([Parameter(Mandatory)] [int] $Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
            Select-Object -First 1
    if (-not $conn) { return $null }
    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) { return "$($proc.Name) (PID $($proc.Id))" }
    return "PID $($conn.OwningProcess)"
}

function Get-LanAddress {
    $ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
          Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
          Sort-Object -Property InterfaceMetric |
          Select-Object -First 1
    if ($ip) { return $ip.IPAddress }
    return 'localhost'
}
