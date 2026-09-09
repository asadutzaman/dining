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
$backend  = Join-Path $InstallRoot 'backend'

# --------------------------------------------------------------- Laravel caches
# All of these run with the working directory set to the backend; artisan resolves paths from it.
Write-Step 'Preparing the application'

# storage:link uses symlink(), which needs SeCreateSymbolicLinkPrivilege. The installer is
# elevated so it normally succeeds, but photos are served through /api/file/view/{id} anyway, so
# a failure here is cosmetic - warn and carry on rather than failing the whole install.
try {
    Invoke-Native -FilePath $php -Arguments @('artisan', 'storage:link', '--no-interaction') -WorkingDirectory $backend
} catch {
    Write-Warn "storage:link failed (harmless - images are served through /api/file/view): $($_.Exception.Message.Split([Environment]::NewLine)[0])"
}

# config:cache freezes env() results, which is safe here because nothing outside config/ calls
# env(); verify-stage.ps1 re-checks that at build time so a regression fails the build instead of
# the deployment. route:cache only works because the SPA routes are controller actions, not
# closures - route:cache refuses to cache a closure-backed route.
Invoke-Native -FilePath $php -Arguments @('artisan', 'config:cache') -WorkingDirectory $backend
Invoke-Native -FilePath $php -Arguments @('artisan', 'route:cache')  -WorkingDirectory $backend
Invoke-Native -FilePath $php -Arguments @('artisan', 'view:cache')   -WorkingDirectory $backend
Write-Ok 'Config, route and view caches built'

# --------------------------------------------------------------- Apache service
if (Get-Service -Name 'DiningWeb' -ErrorAction SilentlyContinue) {
    Write-Step 'DiningWeb service already exists - restarting it'
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
    # delayed-auto plus a dependency on the database: Apache starting before MySQL is ready
    # produces a wall of connection errors on every boot.
    Invoke-Native -FilePath 'sc.exe' -Arguments @('config', 'DiningWeb', 'start=', 'delayed-auto', 'depend=', 'DiningMySQL')
    Invoke-Native -FilePath 'sc.exe' -Arguments @('description', 'DiningWeb', 'Dining Hall web admin (Apache + PHP).')
    Invoke-Native -FilePath 'sc.exe' -Arguments @(
        'failure', 'DiningWeb', 'reset=', '86400',
        'actions=', 'restart/5000/restart/10000/restart/30000')

    Start-Service 'DiningWeb'
}

# --------------------------------------------------------------- smoke test
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

# --------------------------------------------------------------- firewall
# The web admin only. Deliberately no rule for MySQL: it is bound to 127.0.0.1 and must stay
# unreachable from the network.
Write-Step 'Allowing the web admin through the firewall (local subnet only)'
Get-NetFirewallRule -Group 'Dining' -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Dining Web ($WebPort)" -Group 'Dining' `
    -Direction Inbound -Action Allow -Protocol TCP -LocalPort $WebPort `
    -Profile Domain,Private -RemoteAddress LocalSubnet | Out-Null
Write-Ok "Admin reachable at http://$(Get-LanAddress):$WebPort"
