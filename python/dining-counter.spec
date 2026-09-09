# -*- mode: python ; coding: utf-8 -*-
#
# Two executables, one analysis, one COLLECT.
#
#   dining-counter.exe      windowed  -- what the operator double-clicks
#   dining-counter-cli.exe  console   -- same code, readable stdout
#
# The CLI twin exists because a --windowed PyInstaller build leaves sys.stdout as None, and
# CPython's print() then returns silently. That makes `--self-test` and `--test-print` produce
# no output at all through the GUI exe: the installer's self-test gate would have nothing but
# an exit code, and could not tell the operator WHICH check failed.
#
# Sharing one COLLECT is what keeps this from costing a second ~114MB folder -- the two exes sit
# side by side in dist\dining-counter\ over a single copy of Qt.
#
# Build with:  powershell -ExecutionPolicy Bypass -File build.ps1

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'PySide6.QtWebEngineCore',
        'PySide6.QtWebEngineWidgets',
        'PySide6.QtQuick',
        'PySide6.Qt3DCore',
        'PySide6.QtCharts',
        'PySide6.QtMultimedia',
        'tkinter',
        'pytest',
    ],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

_common = dict(
    exclude_binaries=True,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

exe_gui = EXE(pyz, a.scripts, [], name='dining-counter', console=False, **_common)
exe_cli = EXE(pyz, a.scripts, [], name='dining-counter-cli', console=True, **_common)

coll = COLLECT(
    exe_gui,
    exe_cli,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='dining-counter',
)
