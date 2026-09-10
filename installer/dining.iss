; Inno Setup script for the dining counter PC.
;
; Compiled by build-installer.ps1, which passes StageDir and OutDir. Do not run iscc by hand
; against an unverified stage - verify-stage.ps1 is what stops a broken payload shipping.

#ifndef StageDir
  #define StageDir "stage"
#endif
#ifndef OutDir
  #define OutDir "out"
#endif
#ifndef AppVersion
  #define AppVersion "1.0.0"
#endif

#define AppName "Dining Counter"
#define AppPublisher "College Dining"
#define DataRoot "C:\ProgramData\Dining"

[Setup]
AppId={{8E31A7C4-6D2B-4F1A-9C55-DIN1NGC0UNT3R}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName=C:\dining
DisableDirPage=no
DefaultGroupName={#AppName}
OutputDir={#OutDir}
OutputBaseFilename=dining-setup
Compression=lzma2/max
SolidCompression=yes
; The bundled runtimes and PySide6 are x64 only.
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
; Services, the firewall rule and the scheduled task all need elevation.
PrivilegesRequired=admin
MinVersion=10.0.19041
WizardStyle=modern
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\counter\dining-counter.exe
; Room for the runtimes, the app, and the database that grows beside it.
ExtraDiskSpaceRequired=52428800

[Files]
Source: "{#StageDir}\app\backend\*";  DestDir: "{app}\backend";        Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#StageDir}\app\counter\*";  DestDir: "{app}\counter";        Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#StageDir}\runtime\php\*";    DestDir: "{app}\runtime\php";    Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#StageDir}\runtime\apache\*"; DestDir: "{app}\runtime\apache"; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#StageDir}\runtime\mysql\*";  DestDir: "{app}\runtime\mysql";  Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#StageDir}\tools\*";       DestDir: "{app}\tools";          Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#StageDir}\templates\*";   DestDir: "{app}\templates";      Flags: recursesubdirs createallsubdirs ignoreversion

[Dirs]
Name: "{#DataRoot}";          Permissions: everyone-modify
Name: "{#DataRoot}\mysql"
Name: "{#DataRoot}\backup"
Name: "{#DataRoot}\uploads"
Name: "{#DataRoot}\logs"
Name: "{app}\config"

[Icons]
Name: "{commondesktop}\Dining Counter"; Filename: "{app}\counter\dining-counter.exe"; WorkingDir: "{app}\counter"

Name: "{group}\Dining Counter";         Filename: "{app}\counter\dining-counter.exe"; WorkingDir: "{app}\counter"

; The web admin is off by default (see Install-Services.ps1: the DiningWeb service is
; start= demand, stopped at the end of install) and reachable only from this machine
; (httpd-dining.conf.tpl binds to 127.0.0.1). A plain "http://localhost:8000/" shortcut would
; show a connection-refused page whenever the service is stopped, which is most of the time --
; this shortcut starts the service, waits for it to answer, and only then opens the browser.
; It lives on the desktop too, since it is now the only way in to enrolment, prices, payments
; and reports.
Name: "{commondesktop}\Dining Web Admin"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-WindowStyle Hidden -ExecutionPolicy Bypass -NoProfile -File ""{app}\tools\Start-WebAdmin.ps1"" -InstallRoot ""{app}"""; \
  WorkingDir: "{app}\tools"; IconFilename: "{app}\counter\dining-counter.exe"
Name: "{group}\Dining Web Admin"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-WindowStyle Hidden -ExecutionPolicy Bypass -NoProfile -File ""{app}\tools\Start-WebAdmin.ps1"" -InstallRoot ""{app}"""; \
  WorkingDir: "{app}\tools"; IconFilename: "{app}\counter\dining-counter.exe"
Name: "{group}\Stop Web Admin"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-WindowStyle Hidden -ExecutionPolicy Bypass -NoProfile -File ""{app}\tools\Stop-WebAdmin.ps1"""; \
  WorkingDir: "{app}\tools"

Name: "{group}\Dining Self-Test";       Filename: "{app}\counter\dining-counter-cli.exe"; Parameters: "--self-test"; WorkingDir: "{app}\counter"
Name: "{group}\Dining Test Print";      Filename: "{app}\counter\dining-counter-cli.exe"; Parameters: "--test-print"; WorkingDir: "{app}\counter"
Name: "{group}\Backup Now";             Filename: "{app}\tools\backup.cmd"

; Only the counter autostarts. The web admin stays off until someone explicitly opens it.
Name: "{commonstartup}\Dining Counter"; Filename: "{app}\counter\dining-counter.exe"; WorkingDir: "{app}\counter"; Tasks: autostart

[Tasks]
Name: "autostart";   Description: "Start the counter automatically when Windows starts"; GroupDescription: "Counter PC setup:"
Name: "powertweaks"; Description: "Apply counter-PC power and Windows Update settings (recommended)"; GroupDescription: "Counter PC setup:"

[Run]
; Ordered. Each is a PowerShell script; failures surface through Inno's error dialog.
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NonInteractive -NoProfile -File ""{app}\tools\Render-Config.ps1"" -InstallRoot ""{app}"" -DataRoot ""{#DataRoot}"" -WebPort {code:GetWebPort} -MysqlPort {code:GetMysqlPort} -DbPassword ""{code:GetDbPassword}"" -PrinterName ""{code:GetPrinterName}"" -NcmsUrl ""{code:GetNcmsUrl}"""; \
  StatusMsg: "Writing configuration..."; Flags: runhidden waituntilterminated

Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NonInteractive -NoProfile -File ""{app}\tools\Install-Database.ps1"" -InstallRoot ""{app}"" -DataRoot ""{#DataRoot}"" -MysqlPort {code:GetMysqlPort} -DbPassword ""{code:GetDbPassword}"" -DumpPath ""{code:GetDumpPath}"""; \
  StatusMsg: "Setting up the database (this can take a few minutes)..."; Flags: runhidden waituntilterminated

Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NonInteractive -NoProfile -File ""{app}\tools\Install-Services.ps1"" -InstallRoot ""{app}"" -WebPort {code:GetWebPort}"; \
  StatusMsg: "Checking the web admin (it will not stay running)..."; Flags: runhidden waituntilterminated

Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NonInteractive -NoProfile -File ""{app}\tools\Register-BackupTask.ps1"" -InstallRoot ""{app}"" -DataRoot ""{#DataRoot}"""; \
  StatusMsg: "Scheduling nightly backups..."; Flags: runhidden waituntilterminated

Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NonInteractive -NoProfile -File ""{app}\tools\Configure-System.ps1"""; \
  StatusMsg: "Applying counter-PC settings..."; Flags: runhidden waituntilterminated; Tasks: powertweaks

; Self-test last, shown to the operator. Not a gate: the usual cause of a failure is a printer
; that is switched off, and that must not roll back a correct install.
Filename: "{app}\counter\dining-counter-cli.exe"; Parameters: "--self-test"; \
  Description: "Run the counter self-test now"; \
  Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-ExecutionPolicy Bypass -NonInteractive -NoProfile -File ""{app}\tools\Uninstall-Cleanup.ps1"" -InstallRoot ""{app}"" -DataRoot ""{#DataRoot}"""; \
  RunOnceId: "DiningCleanup"; Flags: runhidden waituntilterminated

; NOTE: there is deliberately NO [UninstallDelete] entry for {app}. Inno removes only what it
; installed. A catch-all sweep here is exactly what would destroy a database directory if anyone
; ever relocates one back under {app}. C:\ProgramData\Dining is never touched.

[Code]
var
  PortsPage: TInputQueryWizardPage;
  PrinterPage: TInputQueryWizardPage;
  OptionsPage: TInputOptionWizardPage;
  DumpNoticeShown: Boolean;

function GetDumpPath(Param: String): String;
begin
  Result := ExpandConstant('{src}\dining-full.sql');
  if not FileExists(Result) then
    Result := '';
end;

function GetWebPort(Param: String): String;
begin
  Result := PortsPage.Values[0];
end;

function GetMysqlPort(Param: String): String;
begin
  Result := PortsPage.Values[1];
end;

function GetPrinterName(Param: String): String;
begin
  Result := PrinterPage.Values[0];
end;

function GetNcmsUrl(Param: String): String;
begin
  Result := PrinterPage.Values[1];
end;

function GetDbPassword(Param: String): String;
begin
  { Blank by default. MySQL is bound to 127.0.0.1 and its port is never opened in the firewall,
    so root@localhost is not reachable from the network. A password adds two files that can drift
    apart, which is the failure mode the manual runbook had. }
  if OptionsPage.Values[0] then
    Result := PortsPage.Values[2]
  else
    Result := '';
end;

procedure InitializeWizard;
begin
  PortsPage := CreateInputQueryPage(wpSelectTasks,
    'Ports and database', 'Where the system listens',
    'The counter starts automatically and works on its own. The web admin, for enrolling ' +
    'members and setting prices, only runs when opened from its own shortcut, and only on ' +
    'this PC - it is not reachable from the network, and neither is the database.');
  PortsPage.Add('Web admin port (used only when the web admin is opened):', False);
  PortsPage.Add('Database port:', False);
  PortsPage.Add('Database password (leave blank unless this PC is shared):', True);
  PortsPage.Values[0] := '8000';
  { 3307 by default: a pre-existing MySQL or Laragon on 3306 is common, and two servers fighting
    over one port looks like random database outages rather than a misconfiguration. }
  PortsPage.Values[1] := '3307';
  PortsPage.Values[2] := '';

  PrinterPage := CreateInputQueryPage(PortsPage.ID,
    'Printer and roster', 'Hardware and network settings',
    'The printer name must match exactly what Windows shows under Printers & scanners.');
  PrinterPage.Add('Receipt printer name:', False);
  PrinterPage.Add('NCMS roster API URL:', False);
  PrinterPage.Values[0] := 'RONGTA 80mm Series Printer';
  PrinterPage.Values[1] := 'http://192.168.98.153:8085/ncms/api/';

  OptionsPage := CreateInputOptionPage(PrinterPage.ID,
    'Database security', 'Optional hardening',
    'Only tick this if other people use this PC.', False, False);
  OptionsPage.Add('Set a password on the database account');
  OptionsPage.Values[0] := False;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
var
  WebPort, DbPort: Integer;
begin
  Result := True;

  if CurPageID = PortsPage.ID then
  begin
    WebPort := StrToIntDef(PortsPage.Values[0], -1);
    DbPort  := StrToIntDef(PortsPage.Values[1], -1);

    if (WebPort < 1) or (WebPort > 65535) then
    begin
      MsgBox('The web admin port must be a number between 1 and 65535.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    if (DbPort < 1) or (DbPort > 65535) then
    begin
      MsgBox('The database port must be a number between 1 and 65535.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    if WebPort = DbPort then
    begin
      MsgBox('The web admin and the database cannot share a port.', mbError, MB_OK);
      Result := False;
      Exit;
    end;
  end;

  if (CurPageID = OptionsPage.ID) and OptionsPage.Values[0] and (PortsPage.Values[2] = '') then
  begin
    MsgBox('You asked to set a database password but left the password box on the previous page empty.',
           mbError, MB_OK);
    Result := False;
    Exit;
  end;

  { Say plainly which branch the install is about to take. Restoring versus building fresh is the
    single most consequential thing this installer decides, and it is decided by whether a file
    happens to sit next to setup.exe. }
  if (CurPageID = wpReady) and (not DumpNoticeShown) then
  begin
    DumpNoticeShown := True;
    if GetDumpPath('') <> '' then
      MsgBox('A database dump was found next to this installer:' + #13#10 + #13#10 +
             GetDumpPath('') + #13#10 + #13#10 +
             'It will be restored, and no seed data will be written.',
             mbInformation, MB_OK)
    else
      MsgBox('No dining-full.sql was found next to this installer.' + #13#10 + #13#10 +
             'A new, empty database will be created with placeholder meal prices and a default ' +
             'admin login. If you meant to restore existing members and balances, stop now, put ' +
             'dining-full.sql beside this installer, and run it again.',
             mbConfirmation, MB_OK);
  end;
end;

function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  { A previous install must be removed first: two Apache services on one port, or a second mysqld
    pointed at the same data directory, is not something to discover at a meal service. }
  if RegKeyExists(HKLM, 'SYSTEM\CurrentControlSet\Services\DiningMySQL') or
     RegKeyExists(HKLM, 'SYSTEM\CurrentControlSet\Services\DiningWeb') then
  begin
    if MsgBox('The dining system is already installed on this PC.' + #13#10 + #13#10 +
              'Uninstall it first (your database, backups and photos are always kept), then run ' +
              'this installer again.' + #13#10 + #13#10 +
              'Open Apps & features now?', mbConfirmation, MB_YESNO) = IDYES then
      ShellExec('open', 'ms-settings:appsfeatures', '', '', SW_SHOW, ewNoWait, ResultCode);
    Result := False;
  end;
end;
