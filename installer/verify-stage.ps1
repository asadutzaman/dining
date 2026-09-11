<#
    Fail the build if the staged tree is wrong.

    Every check here exists because the failure it catches is invisible at build time and
    expensive at the counter: a SPA that loads a dead hostname, a Laravel that fatals on boot, a
    counter that ships in printer-test mode. Cheaper to fail here than on a machine in a dining
    hall with a queue in front of it.

        powershell -ExecutionPolicy Bypass -File verify-stage.ps1
#>
[CmdletBinding()]
param(
    [string] $StagePath,
    [string] $RepoRoot
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

if (-not $StagePath) { $StagePath = Join-Path $PSScriptRoot 'stage' }
if (-not $RepoRoot)  { $RepoRoot  = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path }
if (-not (Test-Path $StagePath)) { throw "No stage at $StagePath - run stage-payload.ps1 first." }

$failures = @()
$checks   = 0

function Assert-That {
    param([string] $What, [scriptblock] $Test, [string] $Why)
    $script:checks++
    $ok = $false
    try { $ok = [bool](& $Test) } catch { $ok = $false }
    if ($ok) {
        Write-Host ("  ok   " + $What) -ForegroundColor Green
    } else {
        Write-Host ("  FAIL " + $What) -ForegroundColor Red
        Write-Host ("       " + $Why) -ForegroundColor DarkYellow
        $script:failures += $What
    }
}

$backend = Join-Path $StagePath 'app\backend'
$counter = Join-Path $StagePath 'app\counter'
$public  = Join-Path $backend 'public'

Write-Step 'Backend'

Assert-That 'composer dependencies are installed' `
    { Test-Path (Join-Path $backend 'vendor\autoload.php') } `
    'vendor/ is gitignored, so it only exists where composer install has run. Without it Laravel cannot boot at all.'

Assert-That 'no .env is staged' `
    { -not (Test-Path (Join-Path $backend '.env')) } `
    'The installer generates .env from the chosen ports and password. A staged one would ship a developer database and possibly MEMBER_OTP_BYPASS=true.'

Assert-That 'no stale bootstrap cache' `
    { -not (Get-ChildItem (Join-Path $backend 'bootstrap\cache\*.php') -ErrorAction SilentlyContinue) } `
    'A manifest built from a --dev tree names Ignition/Collision providers that --no-dev removed; Laravel fatals on boot loading them.'

Assert-That 'Helper.php loads in production' `
    { (Get-Content (Join-Path $RepoRoot 'backend\composer.json') -Raw | ConvertFrom-Json).autoload.files -contains 'app/Libraries/Helper.php' } `
    'If it is still under autoload-dev, composer install --no-dev drops it.'

Assert-That 'the SPA fallback route exists' `
    { (Get-Content (Join-Path $backend 'routes\web.php') -Raw) -match 'Route::fallback' } `
    'Without it every deep link into the admin returns 404.'

Assert-That 'no env() calls outside config/' `
    { -not (Get-ChildItem (Join-Path $backend 'app'), (Join-Path $backend 'routes') -Recurse -Filter *.php -ErrorAction SilentlyContinue |
            Select-String -Pattern '(?<![A-Za-z_])env\(' -List | Select-Object -First 1) } `
    'config:cache freezes env(); any env() outside config/ silently becomes null at runtime.'

Write-Step 'Web admin (SPA)'

Assert-That 'index.html was built' `
    { Test-Path (Join-Path $public 'index.html') } `
    'The SPA build did not complete. Nothing will serve the admin.'

Assert-That 'assets use root-absolute paths' `
    { (Get-Content (Join-Path $public 'index.html') -Raw) -match 'src="/static/js/main\.' } `
    'A relative or absolute-URL asset path means homepage/PUBLIC_URL was wrong - deep-link refreshes will 404. Watch for MSYS rewriting PUBLIC_URL to a C:/ path.'

Assert-That 'no stale hostname baked into the bundle' `
    { -not (Get-ChildItem $public -Recurse -Include *.js, *.html, *.css -ErrorAction SilentlyContinue |
            Select-String -Pattern '47\.128\.188\.194' -List | Select-Object -First 1) } `
    'The old public IP is compiled in. The admin would call a server that is not there.'

Assert-That 'no Netlify _redirects artifact' `
    { -not (Test-Path (Join-Path $public '_redirects')) } `
    'Harmless but meaningless here; its presence means the old build script ran.'

Assert-That 'Laravel front controller survived the merge' `
    { Test-Path (Join-Path $public 'index.php') } `
    'Copying the SPA over public/ must not displace index.php or the API disappears.'

Write-Step 'Counter application'

Assert-That 'windowed executable present' `
    { Test-Path (Join-Path $counter 'dining-counter.exe') } `
    'This is what the operator double-clicks.'

Assert-That 'console twin present' `
    { Test-Path (Join-Path $counter 'dining-counter-cli.exe') } `
    'Needed so --self-test output is readable when launched without a console.'

Assert-That 'no developer config.ini staged' `
    { -not (Test-Path (Join-Path $counter 'config.ini')) } `
    'The installer generates it. A staged copy points the counter at the build machine database.'

Assert-That 'printer-test mode is off in the template' `
    { (Get-Content (Join-Path $PSScriptRoot 'templates\config.ini.tpl') -Raw) -match '(?m)^printer_test\s*=\s*false\s*$' } `
    'Shipping printer_test = true means the counter prints receipts and records nothing - every meal served would be free and invisible.'

Assert-That 'no runtime journal or log staged' `
    { -not (Test-Path (Join-Path $counter 'counter-journal.jsonl')) } `
    'That is the build machine audit trail; it must not ship.'

Write-Step 'Web admin: off by default, local only'

Assert-That 'Apache listens on 127.0.0.1 only' `
    { (Get-Content (Join-Path $PSScriptRoot 'templates\httpd-dining.conf.tpl') -Raw) -match '(?m)^Listen\s+127\.0\.0\.1:\{\{WEB_PORT\}\}\s*$' } `
    'A bare "Listen {{WEB_PORT}}" would make the web admin reachable from the whole network, which this build is not meant to do - it is meant to be reachable only from this PC.'

Assert-That 'DiningWeb is registered start= demand, not delayed-auto' `
    { (Get-Content (Join-Path $StagePath 'tools\Install-Services.ps1') -Raw) -match "start=',\s*'demand'" } `
    'delayed-auto means the web admin comes up on every boot whether anyone asked for it or not - the opposite of "desktop app by default, web panel on request".'

Assert-That 'the on-demand web admin launcher is staged' `
    { Test-Path (Join-Path $StagePath 'tools\Start-WebAdmin.ps1') } `
    'Without it the desktop shortcut has nothing to start the stopped service and wait for it before opening the browser.'

Assert-That 'the stop-web-admin script is staged' `
    { Test-Path (Join-Path $StagePath 'tools\Stop-WebAdmin.ps1') } `
    'The Start Menu "Stop Web Admin" shortcut needs this.'

Write-Step 'Runtimes'

$lock = Get-Content (Join-Path $PSScriptRoot 'runtimes.lock.json') -Raw | ConvertFrom-Json
foreach ($name in 'php', 'apache', 'mysql') {
    foreach ($rel in $lock.$name.required_files) {
        $full = Join-Path $StagePath ("runtime\$name\" + ($rel -replace '/', '\'))
        Assert-That "$name/$rel" { Test-Path $full } "Bundled $name is incomplete; the installer cannot run without it."
    }
}

Assert-That 'PHP is the thread-safe build' `
    { Test-Path (Join-Path $StagePath 'runtime\php\php8ts.dll') } `
    'mod_php requires a ZTS build. An NTS PHP cannot be loaded by Apache.'

Write-Step 'Install-time assets'

foreach ($t in 'my.ini.tpl', 'php.ini.tpl', 'httpd-dining.conf.tpl', 'env.production.tpl',
                'config.ini.tpl', 'backup.cmd.tpl', 'dining-backup.task.xml.tpl') {
    Assert-That "template $t" { Test-Path (Join-Path $StagePath "templates\$t") } 'Missing template; the matching install step cannot run.'
}
foreach ($s in 'Dining-Common.ps1', 'Install-Database.ps1', 'Install-Services.ps1',
                'Configure-System.ps1', 'Register-BackupTask.ps1', 'Uninstall-Cleanup.ps1') {
    Assert-That "script $s" { Test-Path (Join-Path $StagePath "tools\$s") } 'Missing install script.'
}

Write-Host ''
if ($failures.Count -gt 0) {
    Write-Fail "$($failures.Count) of $checks checks failed:"
    $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    throw 'Stage verification failed - not building an installer from this tree.'
}
Write-Ok "All $checks checks passed"
