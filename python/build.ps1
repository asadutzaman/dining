# Build dining-counter.exe for the kiosk.
#
#   powershell -ExecutionPolicy Bypass -File build.ps1
#
# Produces dist\dining-counter\dining-counter.exe. Copy that whole folder to the kiosk; no Python
# is needed there.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host 'Installing dependencies...' -ForegroundColor Cyan
python -m pip install -q -r requirements.txt
python -m pip install -q pyinstaller

Write-Host 'Building...' -ForegroundColor Cyan
# --onedir, not --onefile. A one-file PySide6 bundle unpacks ~90MB to a temp directory on every
# launch, which puts 5-10 seconds between the operator double-clicking and the window appearing.
# On a counter with a queue that is the difference between usable and not. --onedir starts in
# about a second.
#
# The Qt modules below are the ones actually used; excluding the rest (WebEngine, Quick, 3D,
# Charts) keeps the folder near 90MB instead of several hundred.
$args = @(
    '--noconfirm',
    '--windowed',
    '--onedir',
    '--name', 'dining-counter',
    '--exclude-module', 'PySide6.QtWebEngineCore',
    '--exclude-module', 'PySide6.QtWebEngineWidgets',
    '--exclude-module', 'PySide6.QtQuick',
    '--exclude-module', 'PySide6.Qt3DCore',
    '--exclude-module', 'PySide6.QtCharts',
    '--exclude-module', 'PySide6.QtMultimedia',
    '--exclude-module', 'tkinter',
    '--exclude-module', 'pytest',
    'main.py'
)
if (Test-Path 'assets\icon.ico') { $args += @('--icon', 'assets\icon.ico') }

python -m PyInstaller @args

# config.ini lives beside the exe, not inside the bundle, so the kiosk's database host, printer
# name and photo folder can be changed without rebuilding.
Copy-Item 'config.ini.example' 'dist\dining-counter\config.ini.example' -Force
if (-not (Test-Path 'dist\dining-counter\config.ini')) {
    Copy-Item 'config.ini.example' 'dist\dining-counter\config.ini'
    Write-Host 'Wrote a starter config.ini into dist\dining-counter\.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Built dist\dining-counter\dining-counter.exe' -ForegroundColor Green
Write-Host 'Next: edit dist\dining-counter\config.ini, then run'
Write-Host '      dist\dining-counter\dining-counter.exe --self-test'
