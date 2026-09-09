# Build the kiosk counter executables.
#
#   powershell -ExecutionPolicy Bypass -File build.ps1
#
# Produces dist\dining-counter\ containing:
#   dining-counter.exe      the windowed app the operator runs
#   dining-counter-cli.exe  the console twin, for --self-test / --test-print
#
# Copy that whole folder to the counter PC; no Python is needed there.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host 'Installing dependencies...' -ForegroundColor Cyan
python -m pip install -q -r requirements.txt
python -m pip install -q pyinstaller

Write-Host 'Building...' -ForegroundColor Cyan
# Driven by dining-counter.spec, not by CLI flags. The spec emits two executables from a single
# analysis and a single COLLECT -- flags cannot express that, and keeping them in one file is what
# stops the GUI and CLI builds from drifting apart. The spec also carries the reasoning for
# --onedir (a one-file PySide6 bundle unpacks ~90MB to temp on every launch, putting 5-10 seconds
# between the double-click and the window) and for the Qt module exclusions.
python -m PyInstaller --noconfirm dining-counter.spec

foreach ($exe in @('dining-counter.exe', 'dining-counter-cli.exe')) {
    if (-not (Test-Path "dist\dining-counter\$exe")) {
        throw "Build did not produce dist\dining-counter\$exe"
    }
}

# config.ini lives beside the exe, not inside the bundle, so the kiosk's database host, printer
# name and photo folder can be changed without rebuilding.
Copy-Item 'config.ini.example' 'dist\dining-counter\config.ini.example' -Force
if (-not (Test-Path 'dist\dining-counter\config.ini')) {
    Copy-Item 'config.ini.example' 'dist\dining-counter\config.ini'
    Write-Host 'Wrote a starter config.ini into dist\dining-counter\.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Built dist\dining-counter\' -ForegroundColor Green
Write-Host 'Next: edit dist\dining-counter\config.ini, then run'
Write-Host '      dist\dining-counter\dining-counter-cli.exe --self-test'
