<#
    Assemble installer\stage\ - everything dining-setup.exe will carry.

        powershell -ExecutionPolicy Bypass -File stage-payload.ps1

    This is the slow, fallible half of the build. It runs composer, builds the SPA, builds the
    counter executables, and proves a fresh database can actually be created from the migrations.

    MUST run in PowerShell, not Git Bash. Passing PUBLIC_URL=/ through a POSIX shell on Windows
    lets MSYS rewrite it to a filesystem path (C:/Program Files/Git/), and CRA then bakes that
    into every asset URL. The build succeeds; the SPA is simply dead. See -SkipSpa notes below.
#>
[CmdletBinding()]
param(
    [string] $RepoRoot,
    [switch] $SkipSpa,
    [switch] $SkipCounter,
    [switch] $SkipMigrationCheck,
    [string] $MysqlBin = 'C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin'
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
$stage      = Join-Path $PSScriptRoot 'stage'
$payloadSrc = Join-Path $PSScriptRoot 'payload-src'
$lock       = Get-Content (Join-Path $PSScriptRoot 'runtimes.lock.json') -Raw | ConvertFrom-Json

Write-Step "Staging from $RepoRoot"
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

# ============================================================ backend
Write-Step 'Building the backend (composer install --no-dev)'
$backendSrc = Join-Path $RepoRoot 'backend'

# The bundled PHP (fetch-runtimes.ps1 already staged it), NOT whatever "composer" resolves to
# on PATH. Composer's lock resolution is platform-aware: running it under a DIFFERENT PHP than
# the one actually shipped can lock a package version that is incompatible with the runtime
# this installer ships. That happened for real: composer install ran here under PHP 8.3 (this
# machine's PATH default) while the bundled runtime is 8.2.21 (pinned for mod_php - see
# runtimes.lock.json), and the resulting lock file pulled in maennchen/zipstream-php 3.2.0,
# which hard-requires PHP >=8.3. Every artisan call on the counter PC then fatals at boot with
# Composer's own platform_check.php, and it is silent until someone actually runs migrate.
$bundledPhp = Join-Path $payloadSrc "$($lock.php.folder)\php.exe"
if (-not (Test-Path $bundledPhp)) { throw "Bundled PHP not found at $bundledPhp - run fetch-runtimes.ps1 first." }

$composerPhar = $null
foreach ($candidate in @(
    'C:\ProgramData\ComposerSetup\bin\composer.phar',
    (Join-Path $env:APPDATA 'Composer\composer.phar'))) {
    if (Test-Path $candidate) { $composerPhar = $candidate; break }
}
if (-not $composerPhar) {
    $cmd = Get-Command 'composer' -ErrorAction SilentlyContinue
    if ($cmd) {
        $sibling = Join-Path (Split-Path $cmd.Source -Parent) 'composer.phar'
        if (Test-Path $sibling) { $composerPhar = $sibling }
    }
}
if (-not $composerPhar) { throw 'composer.phar not found. Install Composer for Windows and try again.' }

# A manifest generated from a --dev tree lists Ignition and Collision providers that --no-dev
# then removes, and Laravel fatals on boot trying to load them. Must go before composer runs.
Get-ChildItem (Join-Path $backendSrc 'bootstrap\cache\*.php') -ErrorAction SilentlyContinue |
    Remove-Item -Force
Invoke-Native -FilePath $bundledPhp -WorkingDirectory $backendSrc -Arguments @(
    $composerPhar, 'install', '--no-dev', '--optimize-autoloader', '--no-interaction', '--no-progress')

Write-Step 'Copying the backend'
$backendDst = Join-Path $stage 'app\backend'
$exclude = @('.env', '.env.backup', '.env.stagecheck', 'node_modules', 'tests', '.git',
             '.gitignore', '.gitattributes', 'webpack.mix.js', 'phpunit.xml', '.styleci.yml')
robocopy $backendSrc $backendDst /E /NFL /NDL /NJH /NJS /NP /XD node_modules tests .git .github `
    /XF .env .env.backup .env.stagecheck phpunit.xml .styleci.yml | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed copying the backend (exit $LASTEXITCODE)" }

# Runtime state must not ship; keep the directories, drop the contents.
foreach ($sub in 'storage\logs', 'storage\framework\cache', 'storage\framework\sessions', 'storage\framework\views') {
    Get-ChildItem (Join-Path $backendDst $sub) -File -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -ne '.gitignore' } | Remove-Item -Force -ErrorAction SilentlyContinue
}
Get-ChildItem (Join-Path $backendDst 'bootstrap\cache\*.php') -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Ok 'Backend staged'

# ============================================================ SPA
if (-not $SkipSpa) {
    Write-Step 'Building the web admin'
    $frontend = Join-Path $RepoRoot 'frontend'

    if (-not (Test-Path (Join-Path $frontend 'yarn.lock'))) {
        throw 'frontend/yarn.lock is missing - the SPA cannot be built reproducibly. Commit the lockfile.'
    }
    if (-not (Test-Path (Join-Path $frontend 'src\app\constants\config.constant.ts'))) {
        throw 'frontend/src/app/constants/config.constant.ts is missing - the SPA will not compile.'
    }

    $nodeMajor = [int](((& node -v) -replace '^v', '') -split '\.')[0]
    if ($nodeMajor -gt 20) {
        Write-Warn "Node $nodeMajor detected. react-scripts 5 is tested on Node 18-20; if the build fails, try Node 20 LTS."
    }

    Invoke-Native -FilePath 'yarn' -WorkingDirectory $frontend -Arguments @('install', '--frozen-lockfile')

    # Set in-process, so no shell can mangle it. PUBLIC_URL wins over package.json's homepage in
    # CRA 5, so staging stays correct even if homepage is ever changed back.
    $env:PUBLIC_URL         = '/'
    $env:GENERATE_SOURCEMAP = 'false'   # ~40MB smaller payload
    $env:CI                 = 'false'   # CI=true turns CRA warnings into errors
    $env:NODE_OPTIONS       = '--max-old-space-size=4096'

    # npx directly, not `yarn build`: the npm script has historically carried a POSIX tail that
    # cmd.exe cannot run.
    Invoke-Native -FilePath 'npx' -WorkingDirectory $frontend -Arguments @('--no-install', 'react-scripts', 'build')

    $index = Join-Path $frontend 'build\index.html'
    if (-not (Test-Path $index)) { throw 'The SPA build produced no index.html' }

    # The SPA lives at the ROOT of public/, which is what root-absolute /static/... asset paths
    # require. Only favicon.ico collides, and CRA's should win.
    Write-Step 'Merging the SPA into the Laravel document root'
    Copy-Item (Join-Path $frontend 'build\*') (Join-Path $backendDst 'public') -Recurse -Force
    Remove-Item (Join-Path $backendDst 'public\_redirects') -Force -ErrorAction SilentlyContinue
    Write-Ok 'Web admin staged'
} else {
    Write-Warn 'Skipping the SPA build (-SkipSpa)'
}

# ============================================================ counter app
if (-not $SkipCounter) {
    Write-Step 'Building the counter application'
    $python = Join-Path $RepoRoot 'python'
    Invoke-Native -FilePath 'powershell' -WorkingDirectory $python -Arguments @(
        '-ExecutionPolicy', 'Bypass', '-File', 'build.ps1')

    $counterDst = Join-Path $stage 'app\counter'
    New-Item -ItemType Directory -Force -Path $counterDst | Out-Null
    Copy-Item (Join-Path $python 'dist\dining-counter\*') $counterDst -Recurse -Force

    # config.ini is generated at install time from the chosen ports and printer. Shipping the
    # developer's copy is how a counter PC ends up pointed at the wrong database - or, worse,
    # with printer_test still switched on.
    Remove-Item (Join-Path $counterDst 'config.ini') -Force -ErrorAction SilentlyContinue
    foreach ($junk in 'counter-journal.jsonl', 'dining-counter.log') {
        Remove-Item (Join-Path $counterDst $junk) -Force -ErrorAction SilentlyContinue
    }
    Write-Ok 'Counter application staged'
} else {
    Write-Warn 'Skipping the counter build (-SkipCounter)'
}

# ============================================================ runtimes, scripts, templates
Write-Step 'Staging runtimes, scripts and templates'
foreach ($name in 'php', 'apache', 'mysql') {
    $src = Join-Path $payloadSrc $lock.$name.folder
    if (-not (Test-Path $src)) { throw "Runtime missing: $src`nRun fetch-runtimes.ps1 first." }
    robocopy $src (Join-Path $stage "runtime\$name") /E /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "robocopy failed staging $name" }
}
Copy-Item (Join-Path $PSScriptRoot 'scripts')   (Join-Path $stage 'tools') -Recurse -Force
Copy-Item (Join-Path $PSScriptRoot 'templates') (Join-Path $stage 'templates') -Recurse -Force
Write-Ok 'Runtimes and scripts staged'

# ============================================================ fresh-migration gate
# 80 class-based migrations that have never run fresh against MySQL 8 in CI. Prove it here so a
# broken fresh-install branch fails the BUILD rather than the deployment.
if (-not $SkipMigrationCheck) {
    Write-Step 'Proving a fresh database can be built from the migrations'
    $mysql = Join-Path $MysqlBin 'mysql.exe'
    if (-not (Test-Path $mysql)) {
        Write-Warn "mysql.exe not found at $MysqlBin - skipping the migration check."
    } else {
        $tmpDb = "dining_stagecheck_$(Get-Random -Maximum 99999)"
        $envFile = Join-Path $backendDst '.env'

        # The same bundled PHP + generated php.ini that will actually run this on the counter
        # PC, not whatever 'php' resolves to on the build machine's PATH. That distinction is
        # exactly what let a build-machine-only PHP version reach this check undetected: it
        # proved migrations worked under a PHP nothing ships with. extension_dir is overridden
        # on the command line rather than baked into the copied template, since php.ini.tpl
        # hardcodes C:/dining/runtime/php/ext - correct for a real install, not for this
        # bundled-but-not-yet-installed copy in payload-src.
        $stageCheckIni = Join-Path $env:TEMP "dining-stagecheck-php-$(Get-Random).ini"
        Copy-Item (Join-Path $PSScriptRoot 'templates\php.ini.tpl') $stageCheckIni -Force
        $phpExtDir = Join-Path (Split-Path $bundledPhp -Parent) 'ext'
        function Invoke-StageCheckArtisan {
            param([Parameter(Mandatory)] [string[]] $Arguments)
            Invoke-Native -FilePath $bundledPhp -WorkingDirectory $backendDst -Arguments (
                @('-c', $stageCheckIni, '-d', "extension_dir=$phpExtDir", 'artisan') + $Arguments)
        }

        try {
            & $mysql -u root -e "CREATE DATABASE $tmpDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            if ($LASTEXITCODE -ne 0) { throw "Could not create the scratch database $tmpDb" }

            $tpl = Get-Content (Join-Path $PSScriptRoot 'templates\env.production.tpl') -Raw
            $tpl = $tpl.Replace('{{APP_KEY}}', 'base64:w/69F6dqt5/2rJZxbDWyr9xoZFedprvbwKD18CRopJQ=').
                        Replace('{{WEB_PORT}}', '8000').Replace('{{MYSQL_PORT}}', '3306').
                        Replace('{{DB_NAME}}', $tmpDb).Replace('{{DB_PASSWORD}}', '').
                        Replace('{{DB_PREFIX}}', 'auth_aq4nl4ag_').
                        Replace('{{NCMS_URL}}', 'http://localhost/').Replace('{{NCMS_IMAGE_URL}}', 'http://localhost/')
            [System.IO.File]::WriteAllText($envFile, $tpl, (New-Object System.Text.UTF8Encoding($false)))

            Invoke-StageCheckArtisan -Arguments @('migrate', '--force', '--no-interaction')
            Invoke-StageCheckArtisan -Arguments @('db:seed', '--force', '--no-interaction', '--class=Database\Seeders\AuthSeeder')
            Invoke-StageCheckArtisan -Arguments @('db:seed', '--force', '--no-interaction', '--class=Database\Seeders\DiningBaselineSeeder')
            Write-Ok 'Fresh migrate + seed succeeded'
        } finally {
            # No stderr redirect: under $ErrorActionPreference = 'Stop', PowerShell 5.1 wraps a
            # native command's stderr in a terminating NativeCommandError even when only
            # discarding it - and a throw inside `finally` masks whatever the try block was
            # actually doing. See the identical fix (and its reproduction) in
            # scripts/Dining-Common.ps1's Wait-ForMySql.
            $null = & $mysql -u root -e "DROP DATABASE IF EXISTS $tmpDb;"
            # The staged tree must never carry a .env - the installer generates it.
            Remove-Item $envFile -Force -ErrorAction SilentlyContinue
            Get-ChildItem (Join-Path $backendDst 'bootstrap\cache\*.php') -ErrorAction SilentlyContinue | Remove-Item -Force
            Remove-Item $stageCheckIni -Force -ErrorAction SilentlyContinue
        }
    }
}

$mb = [math]::Round((Get-ChildItem $stage -Recurse -File | Measure-Object Length -Sum).Sum / 1MB)
Write-Ok "Stage complete: $mb MB"
Write-Host 'Next: verify-stage.ps1' -ForegroundColor Gray
