<#
    Populate installer\payload-src\ with the PHP, Apache and MySQL runtimes that get bundled
    into dining-setup.exe, then trim them.

        powershell -ExecutionPolicy Bypass -File fetch-runtimes.ps1
        powershell -ExecutionPolicy Bypass -File fetch-runtimes.ps1 -LaragonRoot D:\laragon

    Source is a local Laragon install. That is deliberate: the three runtimes have to be a
    matched set (see runtimes.lock.json), and Laragon's combination is the one already proven to
    run together on the build machine. Downloading each from its own upstream invites a VS16/VS17
    mismatch that shows up as "Apache silently will not start" rather than as an error.

    Trimming takes the payload from about 440MB to about 150MB. Everything removed here is either
    a development artefact, a debug build, documentation, or an extension this app does not load.
#>
[CmdletBinding()]
param(
    [string] $LaragonRoot = 'C:\laragon',
    [switch] $Force
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

$lock       = Get-Content 'runtimes.lock.json' -Raw | ConvertFrom-Json
$payloadSrc = Join-Path $PSScriptRoot 'payload-src'

function Copy-Runtime {
    param($Name, $Spec)

    $src  = Join-Path $LaragonRoot ($Spec.laragon_path -replace '/', '\')
    $dest = Join-Path $payloadSrc $Spec.folder

    if ((Test-Path $dest) -and -not $Force) {
        Write-Step "$Name $($Spec.version) already staged - skipping (use -Force to refresh)"
        return $dest
    }
    if (-not (Test-Path $src)) {
        throw ("$Name $($Spec.version) not found at $src`n" +
               "  Install it in Laragon, or point -LaragonRoot at the right place.`n" +
               "  Reason this exact version is pinned: $($Spec.why)")
    }

    Write-Step "Copying $Name $($Spec.version)"
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $src $dest -Recurse -Force
    return $dest
}

function Remove-Paths {
    param([string] $Root, [string[]] $Patterns)
    foreach ($pattern in $Patterns) {
        Get-ChildItem (Join-Path $Root $pattern) -Force -ErrorAction SilentlyContinue |
            ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
    }
}

New-Item -ItemType Directory -Force -Path $payloadSrc | Out-Null

# ---------------------------------------------------------------- PHP
$php = Copy-Runtime 'PHP' $lock.php
Remove-Paths $php @(
    'dev', 'lib', 'extras', 'phpdbg.exe', 'php8phpdbg.dll', 'php8embed.lib',
    # Extensions this app never loads. php.ini enables only what composer.json actually needs.
    'ext\php_oci8*.dll', 'ext\php_pdo_oci.dll', 'ext\php_pdo_firebird.dll', 'ext\php_ldap.dll',
    'ext\php_imap.dll', 'ext\php_snmp.dll', 'ext\php_dba.dll', 'ext\php_ffi.dll',
    'ext\php_dl_test.dll', 'ext\php_zend_test.dll', 'ext\php_enchant.dll', 'ext\php_tidy.dll',
    'ext\php_pgsql.dll', 'ext\php_pdo_pgsql.dll', 'ext\php_sqlite3.dll', 'ext\php_pdo_sqlite.dll',
    'ext\php_gettext.dll', 'ext\php_com_dotnet.dll', 'ext\php_shmop.dll', 'ext\php_sysvshm.dll',
    'ext\php_soap.dll', 'ext\php_xsl.dll', 'ext\php_mysqli.dll'
)

# ---------------------------------------------------------------- Apache
$apache = Copy-Runtime 'Apache' $lock.apache
Remove-Paths $apache @(
    'manual', 'include', 'lib', 'cgi-bin', 'htdocs', 'bin\ab.exe', 'bin\abs.exe', 'bin\*.pl',
    # Laragon injects PHP's DLLs into Apache's bin. Ours come from the PHP tree, and a stale
    # duplicate here is how you end up running a different PHP than the one you configured.
    'bin\php8ts.dll', 'bin\php8apache2_4.dll', 'bin\php8phpdbg.dll', 'bin\libpq.dll',
    'bin\libsqlite3.dll', 'bin\libssh2.dll', 'bin\libenchant2.dll', 'bin\glib-2.dll',
    'bin\gmodule-2.dll', 'bin\icu*.dll'
)

# ---------------------------------------------------------------- MySQL
$mysql = Copy-Runtime 'MySQL' $lock.mysql
Remove-Paths $mysql @(
    # ~130MB of debug protobuf libraries that a release server never loads.
    'bin\libprotobuf-debug.dll', 'bin\libprotobuf-lite-debug.dll',
    'bin\*.lib', 'bin\*.pl', 'include', 'docs',
    'bin\mysqlslap.exe', 'bin\mysqlpump.exe', 'bin\mysql_migrate_keyring.exe',
    'bin\mysql_upgrade.exe', 'bin\mysqlimport.exe', 'bin\mysqlshow.exe',
    'bin\mysql_secure_installation.exe', 'bin\perror.exe', 'bin\echo.exe', 'bin\myisam*.exe'
)
# Keep only English error messages.
Get-ChildItem (Join-Path $mysql 'share') -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne 'english' } |
    ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }

# ---------------------------------------------------------------- Verify
Write-Step 'Verifying required files survived the trim'
$missing = @()
foreach ($name in 'php', 'apache', 'mysql') {
    $spec = $lock.$name
    $root = Join-Path $payloadSrc $spec.folder
    foreach ($rel in $spec.required_files) {
        $full = Join-Path $root ($rel -replace '/', '\')
        if (-not (Test-Path $full)) { $missing += "$($spec.folder)\$rel" }
    }
}
if ($missing) { throw "Trim removed files that are required:`n  " + ($missing -join "`n  ") }

$mb = [math]::Round((Get-ChildItem $payloadSrc -Recurse -File |
        Measure-Object Length -Sum).Sum / 1MB)
Write-Ok "Runtimes staged in payload-src ($mb MB)"
