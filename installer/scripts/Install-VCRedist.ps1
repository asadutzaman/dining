<#
    Silently install the Visual C++ Redistributable this build bundles, if a compatible one is
    not already present.

    mysqld.exe, httpd.exe and php.exe are all VS16/VS17-toolset binaries and depend on the VC++
    runtime DLLs. Every dev/build machine this installer was tested on already had them from
    years of other software, which is exactly why this was invisible until a real install hit a
    genuinely clean Windows 10/11 PC: mysqld.exe crashed at --initialize-insecure with exit
    -1073741515 (0xC0000135, STATUS_DLL_NOT_FOUND), and every artisan call after it cascaded
    from that one failure. This step MUST run before Install-Database.ps1 or anything else in
    [Run] that launches a bundled binary.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)] [string] $InstallRoot
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\Dining-Common.ps1"

$installer = Join-Path $InstallRoot 'vcredist\vc_redist.x64.exe'
if (-not (Test-Path $installer)) {
    throw "vc_redist.x64.exe not found at $installer - the installer payload is incomplete."
}

Write-Step 'Installing the Visual C++ Redistributable'
$proc = Start-Process -FilePath $installer -ArgumentList @('/install', '/quiet', '/norestart') -Wait -PassThru
$code = $proc.ExitCode

# 0 = installed. 1638 = an equal or newer version is already present - not a failure, just
# nothing to do. 3010 = installed, but a reboot is needed before it fully takes effect; the
# rest of this install still proceeds, since the DLLs are already usable by new processes.
# Anything else is a genuine failure, and nothing downstream that depends on these DLLs should
# be attempted on top of it.
if ($code -notin @(0, 1638, 3010)) {
    throw "vc_redist.x64.exe failed with exit code $code"
}

if ($code -eq 1638) {
    Write-Ok 'Visual C++ Redistributable already present (equal or newer version installed)'
} elseif ($code -eq 3010) {
    Write-Warn 'Visual C++ Redistributable installed, but a reboot is pending before it fully applies. Continuing setup now; reboot this PC once it finishes.'
} else {
    Write-Ok 'Visual C++ Redistributable installed'
}
