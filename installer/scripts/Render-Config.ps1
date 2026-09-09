<#
    Generate every configuration file on the machine from ONE set of values.

    my.ini, php.ini, httpd.conf, backend\.env, counter\config.ini, backup.cmd and the scheduled
    task all have to agree about the database port, the password and the web port. The manual
    runbook kept them in step by asking a person to edit four files consistently, and its own
    "optional hardening" step is a worked example of how that goes wrong: set a MySQL password
    and forget one of the two files, and the counter stops issuing tokens.

    Rendering them together from the same variables makes drift impossible by construction.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $InstallRoot,
    [Parameter(Mandatory)] [string] $DataRoot,
    [Parameter(Mandatory)] [int]    $WebPort,
    [Parameter(Mandatory)] [int]    $MysqlPort,
    [string] $DbPassword   = '',
    [string] $PrinterName  = 'RONGTA 80mm Series Printer',
    [string] $NcmsUrl      = 'http://192.168.98.153:8085/ncms/api/',
    [string] $NcmsImageUrl = 'http://192.168.100.252:8081/',
    [string] $DbName       = 'dining',
    [string] $DbPrefix     = 'auth_aq4nl4ag_',
    [string] $CounterTitle = 'COLLEGE DINING',
    [string] $BackupTime   = '23:30'
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\Dining-Common.ps1"

$templates = Join-Path $InstallRoot 'templates'
$config    = Join-Path $InstallRoot 'config'
$tools     = Join-Path $InstallRoot 'tools'

New-Item -ItemType Directory -Force -Path $config, $tools,
    (Join-Path $DataRoot 'logs'), (Join-Path $DataRoot 'backup'),
    (Join-Path $DataRoot 'uploads'), (Join-Path $DataRoot 'mysql') | Out-Null

# The APP_KEY from .env.example, never regenerated. A restored production dump was written under
# this key; rotating it would silently invalidate anything encrypted with it.
$appKey = 'base64:w/69F6dqt5/2rJZxbDWyr9xoZFedprvbwKD18CRopJQ='

Write-Step 'Writing MySQL, PHP and Apache configuration'
Expand-Template (Join-Path $templates 'my.ini.tpl') (Join-Path $config 'my.ini') `
    @{ MYSQL_PORT = $MysqlPort }
Expand-Template (Join-Path $templates 'php.ini.tpl') (Join-Path $config 'php.ini') @{}
Expand-Template (Join-Path $templates 'httpd-dining.conf.tpl') (Join-Path $config 'httpd.conf') `
    @{ WEB_PORT = $WebPort }

Write-Step 'Writing the application environment'
Expand-Template (Join-Path $templates 'env.production.tpl') (Join-Path $InstallRoot 'backend\.env') @{
    APP_KEY        = $appKey
    WEB_PORT       = $WebPort
    MYSQL_PORT     = $MysqlPort
    DB_NAME        = $DbName
    DB_PASSWORD    = $DbPassword
    DB_PREFIX      = $DbPrefix
    NCMS_URL       = $NcmsUrl
    NCMS_IMAGE_URL = $NcmsImageUrl
}

Write-Step 'Writing the counter configuration'
Expand-Template (Join-Path $templates 'config.ini.tpl') (Join-Path $InstallRoot 'counter\config.ini') @{
    MYSQL_PORT    = $MysqlPort
    WEB_PORT      = $WebPort
    DB_NAME       = $DbName
    DB_PASSWORD   = $DbPassword
    DB_PREFIX     = $DbPrefix
    PRINTER_NAME  = $PrinterName
    COUNTER_TITLE = $CounterTitle
}

Write-Step 'Writing the backup script and schedule'
# mysqldump takes -p<password> with no space, and nothing at all when there is no password.
$pwdArg = if ($DbPassword) { "-p$DbPassword" } else { '' }
Expand-Template (Join-Path $templates 'backup.cmd.tpl') (Join-Path $tools 'backup.cmd') `
    @{ PWD_ARG = $pwdArg; DB_NAME = $DbName }
Expand-Template (Join-Path $templates 'dining-backup.task.xml.tpl') (Join-Path $tools 'dining-backup.task.xml') `
    @{ BACKUP_TIME = $BackupTime }

# Member photos live outside the install directory so an uninstall cannot take them with it -
# the deployment notes record that they are hard to obtain at all. A junction, not a symlink:
# mklink /J needs no SeCreateSymbolicLinkPrivilege and no Developer Mode, and if the target
# already holds photos from a previous install they are picked up automatically.
$uploads = Join-Path $InstallRoot 'backend\storage\app\public\uploads'
$target  = Join-Path $DataRoot 'uploads'
if (-not (Test-Path $uploads)) {
    Write-Step 'Linking the photo folder to the data directory'
    $parent = Split-Path $uploads -Parent
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    & cmd.exe /c mklink /J "`"$uploads`"" "`"$target`"" | Out-Null
    if (-not (Test-Path $uploads)) {
        Write-Warn 'Could not create the uploads junction; photos will be stored inside the install directory instead.'
        New-Item -ItemType Directory -Force -Path $uploads | Out-Null
    }
}

# A shell for whoever has to look at the database later, with the right port and password baked in.
$shim = @"
@echo off
rem Opens a MySQL prompt against the dining database with the right port and credentials.
"$InstallRoot\runtime\mysql\bin\mysql.exe" --defaults-file="$InstallRoot\config\my.ini" -u root $pwdArg $DbName %*
"@
[System.IO.File]::WriteAllText((Join-Path $tools 'dining-mysql.cmd'), $shim,
    (New-Object System.Text.UTF8Encoding($false)))

if ($DbPassword) {
    $credFile = Join-Path $DataRoot 'db-credentials.txt'
    [System.IO.File]::WriteAllText($credFile,
        "Dining database credentials`r`nuser: root`r`npassword: $DbPassword`r`nport: $MysqlPort`r`n" +
        "`r`nThese are already written into backend\.env, counter\config.ini and tools\backup.cmd.`r`n",
        (New-Object System.Text.UTF8Encoding($false)))
    Write-Warn "Database password saved to $credFile - move it somewhere safe."
}

Write-Ok 'Configuration written'
