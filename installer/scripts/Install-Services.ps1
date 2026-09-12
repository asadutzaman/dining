<#
    Register Apache (with mod_php) as the DiningWeb service and prepare the Laravel app.

    Why Apache + mod_php rather than "php artisan serve": artisan serve wraps PHP's built-in CLI
    server, which is strictly serial on Windows (PHP_CLI_SERVER_WORKERS is a POSIX fork feature).
    One browser loading the admin queues ~20 asset requests behind each other, and a slow monthly
    report blocks the counter's photo lookups. It also has no restart-on-crash and dies with its
    console. Apache registers itself as a real service, so there is no nssm/srvany anywhere here.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $InstallRoot,
    [Parameter(Mandatory)] [int]    $WebPort
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\Dining-Common.ps1"

$httpd    = Join-Path $InstallRoot 'runtime\apache\bin\httpd.exe'
$conf     = Join-Path $InstallRoot 'config\httpd.conf'
$php      = Join-Path $InstallRoot 'runtime\php\php.exe'
$phpIni   = Join-Path $InstallRoot 'config\php.ini'
$backend  = Join-Path $InstallRoot 'backend'

# php.exe with no -c uses whatever php.ini ships bundled NEXT TO IT in the raw runtime zip -
# not the one this installer generated at config\php.ini. That default carries none of the
# extensions composer.json actually needs (pdo_mysql, zip, ...), so every artisan call here
# must be explicit about which ini to load. Apache/mod_php does not have this problem: it is
# told via PHPIniDir in httpd.conf, which has no CLI equivalent.
function Invoke-Artisan {
    param([Parameter(Mandatory)] [string[]] $Arguments)
    Invoke-Native -FilePath $php -Arguments (@('-c', $phpIni, 'artisan') + $Arguments) -WorkingDirectory $backend
}

# --------------------------------------------------------------- Laravel caches
# All of these run with the working directory set to the backend; artisan resolves paths from it.
Write-Step 'Preparing the application'

# storage:link uses symlink(), which needs SeCreateSymbolicLinkPrivilege. The installer is
# elevated so it normally succeeds, but photos are served through /api/file/view/{id} anyway, so
# a failure here is cosmetic - warn and carry on rather than failing the whole install.
try {
    Invoke-Artisan -Arguments @('storage:link', '--no-interaction')
} catch {
    Write-Warn "storage:link failed (harmless - images are served through /api/file/view): $($_.Exception.Message.Split([Environment]::NewLine)[0])"
}

# config:cache freezes env() results, which is safe here because nothing outside config/ calls
# env(); verify-stage.ps1 re-checks that at build time so a regression fails the build instead of
# the deployment. route:cache only works because the SPA routes are controller actions, not
# closures - route:cache refuses to cache a closure-backed route.
Invoke-Artisan -Arguments @('config:cache')
Invoke-Artisan -Arguments @('route:cache')
Invoke-Artisan -Arguments @('view:cache')
Write-Ok 'Config, route and view caches built'

# --------------------------------------------------------------- Apache service
#
# Same reasoning as the DiningMySQL check in Install-Database.ps1: a service literally named
# "DiningWeb" is not proof it is ours. Confirm its binary path is the httpd this installer just
# extracted before touching it - otherwise this would silently reconfigure and restart someone
# else's web server.
$expectedHttpd = (Resolve-Path $httpd).Path
$existingWebSvc = Get-CimInstance -ClassName Win32_Service -Filter "Name='DiningWeb'" -ErrorAction SilentlyContinue

if ($existingWebSvc -and $existingWebSvc.PathName -notlike "*$expectedHttpd*") {
    throw @"
A Windows service named 'DiningWeb' already exists, but it does not belong to this installer:

  $($existingWebSvc.PathName)

This installer expected:

  $expectedHttpd

Rename or remove that other service before installing.
"@
}

# The default Windows service security descriptor grants Interactive Users (IU) - anyone
# logged on at this PC's console - query rights (LC) but NOT SERVICE_START (RP) or
# SERVICE_STOP (WP). That is exactly why the "Dining Web Admin" / "Stop Web Admin" shortcuts,
# launched normally by whoever is sitting at the counter with no elevation, cannot start or
# stop this service at all: the whole point of those shortcuts is to avoid needing an admin
# account (or a UAC prompt) just to open the admin panel, and without this they fail outright
# with "Cannot open DiningWeb service on computer '.'". Only the IU ACE is touched here - SY
# (LocalSystem) and BA (Administrators) keep whatever rights Windows already granted them.
function Grant-DiningWebStartStop {
    $before = (sc.exe sdshow DiningWeb) -join ''
    $after = $before -replace '\(A;;CCLCSWLOCRRC;;;IU\)', '(A;;CCLCSWRPWPLOCRRC;;;IU)'
    if ($after -eq $before) {
        Write-Warn 'Could not find the expected Interactive Users ACE on DiningWeb - leaving its permissions as Windows set them. The web admin shortcuts may require an admin account.'
        return
    }
    sc.exe sdset DiningWeb $after | Out-Null
}

if ($existingWebSvc) {
    Write-Step 'DiningWeb service already exists (confirmed ours) - restarting it'
    # Re-applied on every run, not just at first install: an upgrade from an older version of
    # this installer (which ran the web admin delayed-auto, on the LAN, or without this ACL
    # grant) must not leave that configuration behind just because the service object already
    # existed.
    Invoke-Native -FilePath 'sc.exe' -Arguments @('config', 'DiningWeb', 'start=', 'demand', 'depend=', 'DiningMySQL')
    Grant-DiningWebStartStop
    # opcache.validate_timestamps=0 means changed PHP files are NOT picked up until a restart.
    Restart-Service 'DiningWeb'
} else {
    if (-not (Test-PortFree $WebPort)) {
        throw "Port $WebPort is already in use by $(Get-PortOwner $WebPort). Choose another web port."
    }

    # Syntax-check before installing. A service that fails at first start gives a far less
    # useful message than httpd -t does.
    Write-Step 'Checking the Apache configuration'
    Invoke-Native -FilePath $httpd -Arguments @('-t', '-f', $conf)

    Write-Step 'Registering the DiningWeb service'
    Invoke-Native -FilePath $httpd -Arguments @('-k', 'install', '-n', 'DiningWeb', '-f', $conf)
    # start= demand: the web admin does not run unless someone asks for it, via the
    # "Dining Web Admin" shortcut. The counter app talks straight to MySQL and never needs
    # Apache, so nothing on the scanning critical path depends on this service being up.
    # depend= DiningMySQL is kept so that starting it on demand still brings the database up
    # first if it is somehow not running.
    Invoke-Native -FilePath 'sc.exe' -Arguments @('config', 'DiningWeb', 'start=', 'demand', 'depend=', 'DiningMySQL')
    Invoke-Native -FilePath 'sc.exe' -Arguments @('description', 'DiningWeb', 'Dining Hall web admin (Apache + PHP).')
    Invoke-Native -FilePath 'sc.exe' -Arguments @(
        'failure', 'DiningWeb', 'reset=', '86400',
        'actions=', 'restart/5000/restart/10000/restart/30000')
    Grant-DiningWebStartStop

    Start-Service 'DiningWeb'
}

# --------------------------------------------------------------- smoke test
# Prove Apache actually serves the app while the installer is still on screen, then put it back
# to sleep. Two seconds here is worth far more than discovering a broken vhost at 7am on a Monday.
Write-Step 'Checking the web admin responds'
$ok = $false
foreach ($attempt in 1..10) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$WebPort/app-version" -UseBasicParsing -TimeoutSec 5
        if ($r.StatusCode -eq 200) { Write-Ok "Web admin is up: $($r.Content.Trim())"; $ok = $true; break }
    } catch {
        Start-Sleep -Seconds 2
    }
}
if (-not $ok) {
    Write-Warn "The web admin did not answer on port $WebPort. Check C:\ProgramData\Dining\logs\apache-error.log."
}

Write-Step 'Stopping the web admin (it starts on demand from now on)'
Stop-Service 'DiningWeb' -Force -ErrorAction SilentlyContinue
Write-Ok 'Web admin is installed but not running'

# --------------------------------------------------------------- firewall
# No inbound rule is created, for either service. Apache listens on 127.0.0.1 and MySQL on
# 127.0.0.1, so there is nothing to allow - and a rule opening a port that nothing serves
# publicly is worse than no rule, since it reads as if the port is meant to be reachable. Any
# rule left over from an older LAN-enabled install is removed here.
Get-NetFirewallRule -Group 'Dining' -ErrorAction SilentlyContinue |
    Remove-NetFirewallRule -ErrorAction SilentlyContinue

Write-Ok "Web admin will be available at http://localhost:$WebPort when started from the shortcut"
