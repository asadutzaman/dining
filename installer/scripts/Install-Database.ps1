<#
    Initialize the bundled MySQL, register it as a service, and put the schema in place.

    Two branches, chosen by whether a dump was shipped beside setup.exe:

      restore  dining-full.sql exists -> restore it, then migrate forward.
               NO SEEDERS, EVER. AuthSeeder truncates users, roles, permissions, organizations,
               workspaces, application_settings, resources, scopes and oauth clients; running it
               against real data destroys the user and permission set and orphans every
               meal_tokens.issued_by.

      fresh    no dump -> migrate, then AuthSeeder + DiningBaselineSeeder.
               DiningSeeder is never called: it truncates members, tokens, payments and meal
               settings and fills them with faker data.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $InstallRoot,
    [Parameter(Mandatory)] [string] $DataRoot,
    [Parameter(Mandatory)] [int]    $MysqlPort,
    [string] $DbName     = 'dining',
    [string] $DbPassword = '',
    [string] $DumpPath   = ''
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\Dining-Common.ps1"

$mysqlBin   = Join-Path $InstallRoot 'runtime\mysql\bin'
$mysqld     = Join-Path $mysqlBin 'mysqld.exe'
$mysql      = Join-Path $mysqlBin 'mysql.exe'
$mysqladmin = Join-Path $mysqlBin 'mysqladmin.exe'
$myIni      = Join-Path $InstallRoot 'config\my.ini'
$dataDir    = Join-Path $DataRoot 'mysql'
$errorLog   = Join-Path $DataRoot 'logs\mysql-error.log'
$php        = Join-Path $InstallRoot 'runtime\php\php.exe'
$backend    = Join-Path $InstallRoot 'backend'

function Get-RootArgs {
    $a = @("--defaults-file=$myIni", '-u', 'root')
    if ($DbPassword) { $a += "-p$DbPassword" }
    return $a
}

function Invoke-Sql {
    param([string] $Sql, [string] $Database = '')
    $a = Get-RootArgs
    if ($Database) { $a += $Database }
    $a += @('--default-character-set=utf8mb4', '-e', $Sql)
    Invoke-Native -FilePath $mysql -Arguments $a
}

# --------------------------------------------------------------- service
#
# A service literally named "DiningMySQL" existing is not by itself proof that it is OURS.
# Anyone can register any mysqld under that name - a Laragon MySQL instance registered as a
# Windows service under this exact name was hit for real while testing this installer, on a
# machine where Dining Counter had never actually been installed. Blindly "reusing" it would mean
# running CREATE DATABASE, migrate and the seeders against a completely unrelated database (in
# that case, a developer's live working database), silently. Ownership is checked by confirming
# the service's own binary path is the mysqld this installer just extracted.
$expectedMysqld = (Resolve-Path $mysqld).Path
$existingSvc = Get-CimInstance -ClassName Win32_Service -Filter "Name='DiningMySQL'" -ErrorAction SilentlyContinue

if ($existingSvc -and $existingSvc.PathName -notlike "*$expectedMysqld*") {
    throw @"
A Windows service named 'DiningMySQL' already exists, but it does not belong to this installer:

  $($existingSvc.PathName)

This installer expected:

  $expectedMysqld

Reusing a service under a false assumption risks running this installer's migrations and seeders
against the WRONG database. Rename or remove that other service before installing.
"@
}

if ($existingSvc) {
    Write-Step 'DiningMySQL service already exists (confirmed ours) - reusing it'
    if ((Get-Service 'DiningMySQL').Status -ne 'Running') { Start-Service 'DiningMySQL' }
} else {
    if (-not (Test-PortFree $MysqlPort)) {
        throw "Port $MysqlPort is already in use by $(Get-PortOwner $MysqlPort). Choose another database port."
    }

    New-Item -ItemType Directory -Force -Path $dataDir, (Join-Path $DataRoot 'logs') | Out-Null

    if (Test-Path (Join-Path $dataDir 'mysql')) {
        Write-Step 'Existing data directory found - keeping it'
    } else {
        Write-Step 'Initializing the database (this takes a moment)'
        # lower_case_table_names can ONLY be set at initialize time and must match the machine
        # the dump came from (Windows default is 1). Changing it later corrupts the server on
        # the next restart.
        Invoke-Native -FilePath $mysqld -Arguments @(
            "--defaults-file=$myIni", '--initialize-insecure',
            '--lower_case_table_names=1', '--console')
    }

    Write-Step 'Registering the DiningMySQL service'
    Invoke-Native -FilePath $mysqld -Arguments @('--install', 'DiningMySQL', "--defaults-file=$myIni")
    Invoke-Native -FilePath 'sc.exe' -Arguments @('config', 'DiningMySQL', 'start=', 'auto')
    Invoke-Native -FilePath 'sc.exe' -Arguments @('description', 'DiningMySQL', 'Dining Hall database (MySQL).')
    # Restart on crash: this PC is unattended, and a stopped database means the counter refuses
    # every scan until someone notices.
    Invoke-Native -FilePath 'sc.exe' -Arguments @(
        'failure', 'DiningMySQL', 'reset=', '86400',
        'actions=', 'restart/5000/restart/10000/restart/30000')

    Start-Service 'DiningMySQL'
}

Wait-ForMySql -MysqlAdmin $mysqladmin -DefaultsFile $myIni -Password $DbPassword -ErrorLog $errorLog

# --------------------------------------------------------------- database
Write-Step "Creating the '$DbName' database if it does not exist"
Invoke-Sql "CREATE DATABASE IF NOT EXISTS ``$DbName`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# --------------------------------------------------------------- schema and data
# Every artisan call sets the working directory to the backend, because seeders such as
# UsersSeeder read their json with a RELATIVE path and fail from anywhere else.
$restoring = $DumpPath -and (Test-Path $DumpPath)

if ($restoring) {
    Write-Step "Restoring $([System.IO.Path]::GetFileName($DumpPath))"
    $a = Get-RootArgs
    $a += @('--default-character-set=utf8mb4', $DbName, '-e', "source $($DumpPath -replace '\\','/')")
    Invoke-Native -FilePath $mysql -Arguments $a

    # The shipped dump's schema lags the migrations (the counter app's repository notes this
    # explicitly). Migrating forward is what the admin's booking and mobile features need, and
    # it is safe for the counter because every added column has a default.
    Write-Step 'Applying any migrations the dump predates'
    Invoke-Native -FilePath $php -Arguments @('artisan', 'migrate', '--force', '--no-interaction') -WorkingDirectory $backend
} else {
    Write-Step 'No dump supplied - building a fresh database'
    Invoke-Native -FilePath $php -Arguments @('artisan', 'migrate', '--force', '--no-interaction') -WorkingDirectory $backend

    Write-Step 'Seeding users, roles and permissions'
    Invoke-Native -FilePath $php -Arguments @(
        'artisan', 'db:seed', '--force', '--no-interaction',
        '--class=Database\Seeders\AuthSeeder') -WorkingDirectory $backend

    # Without this the system comes up with no rate for any meal, refuses every scan with
    # "No active cost setting found", and the counter self-test fails on all three meals.
    Write-Step 'Seeding baseline meal rates'
    Invoke-Native -FilePath $php -Arguments @(
        'artisan', 'db:seed', '--force', '--no-interaction',
        '--class=Database\Seeders\DiningBaselineSeeder') -WorkingDirectory $backend
}

# --------------------------------------------------------------- report
$envFile = Join-Path $backend '.env'
$prefixMatch = Select-String -Path $envFile -Pattern '^DB_PREFIX=(.*)$'
$prefix = if ($prefixMatch) { $prefixMatch.Matches[0].Groups[1].Value.Trim() } else { '' }

$a = Get-RootArgs
$a += @('-N', '-B', $DbName, '-e',
        "SELECT (SELECT COUNT(*) FROM ${prefix}members), (SELECT COUNT(*) FROM ${prefix}meal_tokens), (SELECT COUNT(*) FROM ${prefix}meal_settings WHERE status=1);")
$counts = Invoke-Native -FilePath $mysql -Arguments $a -PassThru

$parts = (($counts | Select-Object -Last 1) -split "`t")
Write-Ok ("Database ready: {0} members, {1} tokens, {2} active meal rates" -f $parts[0], $parts[1], $parts[2])

if (-not $restoring) {
    Write-Warn 'Fresh install: sign in as admin@gmail.com / 123456 and change that password immediately.'
}
