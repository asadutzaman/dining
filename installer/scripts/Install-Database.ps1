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
$phpIni     = Join-Path $InstallRoot 'config\php.ini'
$backend    = Join-Path $InstallRoot 'backend'

# php.exe with no -c uses whatever php.ini ships bundled NEXT TO IT in the raw runtime zip -
# not the one this installer generated at config\php.ini. That default carries none of the
# extensions composer.json actually needs (pdo_mysql, zip, ...), so every artisan call here
# must be explicit about which ini to load. Apache/mod_php does not have this problem: it is
# told via PHPIniDir in httpd.conf, which has no CLI equivalent.
function Invoke-Artisan {
    param([Parameter(Mandatory)] [string[]] $Arguments)
    Invoke-Native -FilePath $php -Arguments (@('-c', $phpIni, 'artisan') + $Arguments) -WorkingDirectory $backend
}

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

# --------------------------------------------------------------- root account grants
#
# MySQL's grant table treats 'root'@'localhost' and 'root'@'127.0.0.1' as two entirely
# different accounts, and --initialize-insecure only ever creates 'root'@'localhost'. This
# server has no named pipe enabled, so on Windows EVERY client connection is TCP - and that
# holds no matter what host string the client asks for. Reproduced directly against this exact
# staged mysqld: "no --host", "--host=127.0.0.1" and "--host=localhost" all fail IDENTICALLY
# with error 1130 against a server that only has 'root'@'localhost', because the server matches
# purely on the connecting socket's peer address, which is 127.0.0.1 regardless.
#
# That means the OLD version of this fix - connect with the mysql.exe client, then run
# CREATE USER 'root'@'127.0.0.1' - could never actually work on a genuinely fresh install: it
# needs the very account it is trying to create in order to authenticate and create it. It only
# ever appeared to work in testing because the dev machine's data directory already carried a
# manually-added root@127.0.0.1 grant from earlier troubleshooting - invisible right up until a
# real clean PC hit it, exactly like the missing VC++ Redistributable before it.
#
# The actual fix is --init-file: mysqld runs that SQL itself while starting up, with no client
# authentication involved at all. Bring the server up standalone here (not yet the Windows
# service - that gets registered afterward), let --init-file apply the grant, confirm it by
# actually connecting, then shut it down cleanly so the service registration below attaches to
# a clean data directory. This also sets root's real password (whatever the operator chose, or
# none) on both accounts - nothing else in this installer ever sets one.
$escapedPwd = $DbPassword -replace "'", "''"
$grantSql = @"
CREATE USER IF NOT EXISTS 'root'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '$escapedPwd';
ALTER USER 'root'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '$escapedPwd';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'127.0.0.1' WITH GRANT OPTION;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$escapedPwd';
FLUSH PRIVILEGES;
"@

function Invoke-GrantBootstrap {
    Write-Step 'Granting root access from 127.0.0.1 (the only address any real client here ever uses)'
    $bootstrapSql = Join-Path $env:TEMP "dining-bootstrap-grants-$([guid]::NewGuid()).sql"
    $bootstrapLog = Join-Path $DataRoot 'logs\mysql-bootstrap.log'
    try {
        Set-Content -Path $bootstrapSql -Value $grantSql -Encoding ascii
        $bootstrapProc = Start-Process -FilePath $mysqld -ArgumentList @(
            "--defaults-file=$myIni", "--init-file=$($bootstrapSql -replace '\\','/')", '--console'
        ) -PassThru -WindowStyle Hidden `
          -RedirectStandardOutput $bootstrapLog -RedirectStandardError "$bootstrapLog.err"
        try {
            Wait-ForMySql -MysqlAdmin $mysqladmin -DefaultsFile $myIni -Password $DbPassword -ErrorLog $errorLog
            Write-Ok 'root@127.0.0.1 and root@localhost both usable'
        } finally {
            if (-not $bootstrapProc.HasExited) {
                $a = @("--defaults-file=$myIni", '-u', 'root')
                if ($DbPassword) { $a += "-p$DbPassword" }
                $a += 'shutdown'
                Invoke-Native -FilePath $mysqladmin -Arguments $a
                $bootstrapProc.WaitForExit(30000) | Out-Null
                if (-not $bootstrapProc.HasExited) { Stop-Process -Id $bootstrapProc.Id -Force }
            }
        }
    } finally {
        Remove-Item $bootstrapSql -Force -ErrorAction SilentlyContinue
    }
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

    # Whether this just ran --initialize-insecure or found an existing-but-orphaned data
    # directory (e.g. from an install interrupted earlier), the Windows service for it does not
    # exist yet either way, so it is always safe - and always necessary - to bootstrap the
    # grant here, before anything tries to connect to it as a client.
    Invoke-GrantBootstrap

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

# By this point root@127.0.0.1 is always on $DbPassword: either just bootstrapped above via
# --init-file, or carried over from an earlier successful run of this same installer against an
# existing service.
$currentPassword = $DbPassword
Wait-ForMySql -MysqlAdmin $mysqladmin -DefaultsFile $myIni -Password $currentPassword -ErrorLog $errorLog

# Idempotent safety net for the reused-service path above, where Invoke-GrantBootstrap never
# ran: cheap insurance in case an earlier run of this installer did not finish applying it.
if ($existingSvc) {
    $a = @("--defaults-file=$myIni", '-u', 'root')
    if ($currentPassword) { $a += "-p$currentPassword" }
    $a += @('--default-character-set=utf8mb4', '-e', $grantSql)
    Invoke-Native -FilePath $mysql -Arguments $a
}

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
    Invoke-Artisan -Arguments @('migrate', '--force', '--no-interaction')
} else {
    Write-Step 'No dump supplied - building a fresh database'
    Invoke-Artisan -Arguments @('migrate', '--force', '--no-interaction')

    Write-Step 'Seeding users, roles and permissions'
    Invoke-Artisan -Arguments @(
        'db:seed', '--force', '--no-interaction', '--class=Database\Seeders\AuthSeeder')

    # Without this the system comes up with no rate for any meal, refuses every scan with
    # "No active cost setting found", and the counter self-test fails on all three meals.
    Write-Step 'Seeding baseline meal rates'
    Invoke-Artisan -Arguments @(
        'db:seed', '--force', '--no-interaction', '--class=Database\Seeders\DiningBaselineSeeder')
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
