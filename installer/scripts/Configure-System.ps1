<#
    Windows settings a counter PC needs. Every step is best-effort and logs what it did: none of
    these is worth failing an otherwise good install over, but silently skipping them is how the
    card reader dies after an idle hour and nobody knows why.
#>
[CmdletBinding()]
param(
    [int] $ActiveHoursStart = 6,
    [int] $ActiveHoursEnd   = 23
)

$ErrorActionPreference = 'Continue'
. "$PSScriptRoot\Dining-Common.ps1"

# --------------------------------------------------------------- sleep
Write-Step 'Disabling sleep, hibernation and display/disk timeouts'
foreach ($setting in 'standby-timeout-ac', 'hibernate-timeout-ac', 'monitor-timeout-ac', 'disk-timeout-ac') {
    & powercfg /change $setting 0 2>&1 | Out-Null
}
Write-Ok 'Power timeouts disabled on AC'

# --------------------------------------------------------------- USB, part 1
# Power-plan level USB selective suspend.
Write-Step 'Turning off USB selective suspend'
$usbSubgroup = '2a737441-1930-4402-8d77-b2bebba308a3'
$suspendGuid = '48e6b7a6-50f5-4782-a5d4-53bb8f07e226'
& powercfg /setacvalueindex SCHEME_CURRENT $usbSubgroup $suspendGuid 0 2>&1 | Out-Null
& powercfg /setdcvalueindex SCHEME_CURRENT $usbSubgroup $suspendGuid 0 2>&1 | Out-Null
# Required: setting the value alone does not apply it to the running scheme.
& powercfg /setactive SCHEME_CURRENT 2>&1 | Out-Null
Write-Ok 'USB selective suspend disabled'

# --------------------------------------------------------------- USB, part 2
# The per-device "Allow the computer to turn off this device to save power" checkbox. This is the
# one that actually kills RFID readers, and it is NOT a powercfg setting - it lives in the
# MSPower_DeviceEnable WMI class.
#
# Get-WmiObject with .Put(), not Set-CimInstance: the root\wmi power providers frequently reject
# CIM writes with "Provider is not capable of the attempted operation".
#
# The registry route (Enum\...\Device Parameters\SelectiveSuspendEnabled) is deliberately not
# attempted: those keys are ACL'd to SYSTEM and an elevated admin still gets Access Denied.
Write-Step 'Disabling per-device USB power management (hubs)'
$changed = 0; $skipped = 0
try {
    $targets = Get-PnpDevice -Class USB -Status OK -ErrorAction Stop |
               Where-Object { $_.FriendlyName -match 'Root Hub|Generic USB Hub|Composite' }
    $wanted = @($targets | ForEach-Object { "$($_.InstanceId)_0" })

    Get-WmiObject -Namespace root\wmi -Class MSPower_DeviceEnable -ErrorAction Stop |
        Where-Object { $wanted -contains $_.InstanceName } |
        ForEach-Object {
            try {
                if ($_.Enable) { $_.Enable = $false; $_.Put() | Out-Null; $changed++ }
            } catch {
                # Plenty of devices have no writable instance. One failure must not stop the rest.
                $skipped++
            }
        }
    Write-Ok "USB power management: $changed hub(s) changed, $skipped skipped"
} catch {
    Write-Warn "Could not enumerate USB power settings: $($_.Exception.Message)"
    Write-Warn 'Do this by hand: Device Manager -> USB controllers -> each Root Hub -> Power Management -> untick "Allow the computer to turn off this device".'
}

# --------------------------------------------------------------- Windows Update
Write-Step "Setting Windows Update active hours to ${ActiveHoursStart}:00-${ActiveHoursEnd}:00"
try {
    # The maximum span is 18 hours; 06->23 is 17, so this is accepted.
    $key = 'HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings'
    if (-not (Test-Path $key)) { New-Item -Path $key -Force | Out-Null }
    Set-ItemProperty -Path $key -Name 'ActiveHoursStart'      -Value $ActiveHoursStart -Type DWord
    Set-ItemProperty -Path $key -Name 'ActiveHoursEnd'        -Value $ActiveHoursEnd   -Type DWord
    # Stop Windows re-deciding the range from usage patterns.
    Set-ItemProperty -Path $key -Name 'SmartActiveHoursState' -Value 0 -Type DWord
    Write-Ok 'Active hours set'
} catch {
    Write-Warn "Could not set active hours: $($_.Exception.Message)"
}

# The no-auto-reboot policy is Pro/Enterprise only - it is ignored on Windows 11 Home, which a
# counter PC often is. Active hours above is the setting that actually works on Home, so log the
# edition rather than leaving the outcome a mystery later.
$edition = (Get-CimInstance Win32_OperatingSystem).Caption
Write-DiningLog "OS edition: $edition"
try {
    $auKey = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU'
    if (-not (Test-Path $auKey)) { New-Item -Path $auKey -Force | Out-Null }
    Set-ItemProperty -Path $auKey -Name 'NoAutoRebootWithLoggedOnUsers' -Value 1 -Type DWord
    if ($edition -match 'Home') {
        Write-Warn "$edition ignores Windows Update policy keys; active hours is what will protect meal times."
    } else {
        Write-Ok 'No-auto-reboot policy set'
    }
} catch {
    Write-Warn "Could not set the reboot policy: $($_.Exception.Message)"
}

Write-Ok 'System configuration finished'
