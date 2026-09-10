# Installer

Builds `dining-setup.exe` — one file that takes a bare Windows 11 PC to a working dining counter
with **no internet and no pre-installed software**. It replaces the manual procedure in
[../docs/counter-pc-deployment.md](../docs/counter-pc-deployment.md), which remains the reference
for the operator's daily routine (Part 3) and for what the hardware needs.

**Desktop app first, web panel on request.** The counter (`dining-counter.exe`) is what this
machine is for: it starts with Windows, talks straight to MySQL, and needs nothing else running.
The web admin — for enrolling members, setting prices, collecting payments and running reports —
is installed but sits **stopped** until someone opens it from the "Dining Web Admin" shortcut, and
even then it answers only on `127.0.0.1`. It is never reachable from another PC. Node and Python
are not installed on this machine either: Node only ever compiles the web admin into static files
on the *build* machine, and Python is frozen inside `dining-counter.exe` by PyInstaller — nothing
on the counter PC would execute either one.

The consequence worth knowing up front: **enrolment, prices, payments and reports can only be done
standing at the counter PC.** If your dining hall needs the office to do that work from its own
desk, this build is not that — say so and the web port can be opened to the LAN instead.

## What ends up on the machine

```
C:\dining\
    runtime\{php,apache,mysql}   bundled portable runtimes
    backend\                     Laravel API + the built web admin in public\
    counter\                     dining-counter.exe + config.ini
    config\                      my.ini, php.ini, httpd.conf
    tools\                       install/uninstall scripts, backup.cmd
    templates\                   the sources those configs were rendered from

C:\ProgramData\Dining\           NEVER removed by uninstall
    mysql\      the database
    backup\     nightly dumps
    uploads\    member photos (junctioned into the Laravel storage tree)
    logs\
```

Two Windows services: **DiningMySQL** (`start= auto` — the counter app talks straight to it and
needs it running always) and **DiningWeb** (Apache + mod_php, `start= demand` — stopped after
install, and started only by the `Start-WebAdmin.ps1` launcher behind the desktop shortcut). Both
have `sc failure` restart policies. There is no `nssm` or `srvany` anywhere — both servers
register themselves.

## Building

Prerequisites on the build machine: **Inno Setup 6** (`winget install JRSoftware.InnoSetup`),
Composer, Node + Yarn, PHP, Python with PySide6, and a Laragon install to source the runtimes
from.

```powershell
powershell -ExecutionPolicy Bypass -File build-installer.ps1
```

That runs: `fetch-runtimes` → `stage-payload` → `verify-stage` → `iscc`, and writes
`out\dining-setup.exe`.

> **Build in PowerShell, never Git Bash.** MSYS rewrites `PUBLIC_URL=/` into a filesystem path
> (`C:/Program Files/Git/`), and CRA bakes that into every asset URL. The build *succeeds* and the
> SPA is simply dead. `verify-stage.ps1` catches it, but do not fight it in the first place.

| Script | Does |
|---|---|
| `fetch-runtimes.ps1` | Copies PHP/Apache/MySQL out of Laragon into `payload-src\`, then trims ~440MB down to ~150MB |
| `stage-payload.ps1` | `composer install --no-dev`, builds the SPA, builds the counter, assembles `stage\`, and proves a fresh database can be built from the migrations |
| `verify-stage.ps1` | The gate. Fails the build rather than shipping a broken payload |
| `dining.iss` | Wizard, file layout, service registration, uninstaller |

### Why the runtimes are pinned as a set

See `runtimes.lock.json`. Apache's `php8apache2_4.dll` and the PHP build must come from the same
Visual Studio toolset or Apache will not load PHP at all. MySQL is pinned to **8.0.x** because
8.4 removed `mysql_native_password`, which the counter's PyMySQL needs. PHP must be the
**thread-safe (ZTS)** build — an NTS build cannot be used with mod_php.

## Deploying

1. Copy `dining-setup.exe` to the counter PC.
2. **To restore existing members and balances, put `dining-full.sql` beside it.** Produce it with:
   ```powershell
   mysqldump -u root --single-transaction --routines --events dining > dining-full.sql
   ```
3. Right-click → **Run as administrator**.

The installer asks for the web port (default 8000), the database port (default **3307**), the
printer name, and the NCMS roster URL, then does everything else. It states plainly on the last
page whether it restored a dump or built an empty database.

### The two branches

| Dump present | What happens |
|---|---|
| **Yes** | Restore, then `migrate` forward (the dump's schema lags the migrations). **No seeders, ever** — `AuthSeeder` truncates users, roles, permissions and organizations, which would destroy the real data. |
| **No** | `migrate`, then `AuthSeeder` + `DiningBaselineSeeder`. Sign in as `admin@gmail.com` / `123456` and change it immediately. `DiningSeeder` is never called — it truncates members, tokens and payments and inserts faker data. |

`DiningBaselineSeeder` exists because nothing else writes `meal_settings`: without it a fresh
install has no rate for any meal, refuses every scan, and fails its own self-test.

## Ports

The database defaults to **3307**, not 3306, chosen rather than probed. A pre-existing MySQL or
Laragon on 3306 is common, and two servers fighting over one port presents as random database
outages rather than as a misconfiguration.

**Neither service is reachable from the network, and no firewall rule is ever created for
either.** MySQL is bound to `127.0.0.1` because the counter and Laravel both run on this one box.
Apache is *also* bound to `127.0.0.1` (`Listen 127.0.0.1:8000`, not `Listen 8000`) —
the web admin is meant to be opened only by whoever is standing at this machine. If you need the
office to reach it from their own PC, change `Listen` in `templates\httpd-dining.conf.tpl` back
to a bare port and add a `New-NetFirewallRule ... -RemoteAddress LocalSubnet` step to
`Install-Services.ps1`; that was this build's previous behaviour and is a small change to restore.

`tools\dining-mysql.cmd` gives a MySQL prompt with the right port and credentials already applied.

## Configuration is generated, not edited

`Render-Config.ps1` writes `my.ini`, `php.ini`, `httpd.conf`, `backend\.env`,
`counter\config.ini`, `backup.cmd` and the task XML **from one set of values**. The manual runbook
kept these in step by asking a person to edit four files consistently; its own optional-hardening
step is a worked example of how that fails — set a database password, forget one file, and the
counter silently stops issuing tokens.

Editing `C:\dining\config\*` by hand is fine, but a reinstall overwrites it. Change the template
if you want it to stick.

> Templates render **without a BOM** deliberately. Both `configparser` and MySQL's parser treat a
> leading BOM as content and then report an error pointing at a line that looks perfectly correct.

## Uninstall

Takes a safety dump first, then removes both services (waiting up to 60s for a clean InnoDB
shutdown — killing `mysqld` with a warm buffer pool is how a data directory gets corrupted), the
scheduled task, any leftover firewall rule from an older LAN-enabled install, and the uploads
junction (`rmdir`, which removes the link and never the target).

**`C:\ProgramData\Dining\` is kept in full.** Member balances are a running total that nothing
else can reconstruct — there is no ledger — so deleting the data directory loses every member's
outstanding due permanently. The `.iss` carries no catch-all `[UninstallDelete]` for this reason.

Power settings and Windows Update active hours are deliberately not reverted.

## Testing this before it touches a real counter

Use a clean Windows 11 VM and run it **twice**, once per branch:

1. **Fresh:** no `.sql` beside the installer. Expect **`DiningMySQL` running and Automatic**,
   **`DiningWeb` stopped and Manual**, three baseline meal rates, and a self-test that is all
   `[ok]` except the printer.
2. **Restore:** with `dining-full.sql`. Expect the real member count, correct token sequence, and
   balances intact.
3. **The counter issues a token with Apache stopped.** This is the point of the whole change —
   confirm the desktop app needs nothing web-related running at all.
4. Click **Dining Web Admin**: the service starts, a browser opens to the admin, sign-in works,
   and `http://admin.../admin/dining/meal-token/issue` resolves via the SPA fallback route.
5. **From a second PC**, confirm `http://<counter-ip>:8000` fails to connect — both while the
   panel is stopped and while it is open on the counter PC itself. This is what proves the
   localhost-only bind actually took effect, not just the wizard copy.
6. Click **Stop Web Admin**: the service stops; the counter keeps issuing tokens unaffected.
7. Run the backup task by hand; confirm a `.sql` larger than 10KB appears.
8. Reboot; confirm the counter autostarts and the web admin does **not**.
9. Uninstall; confirm `C:\ProgramData\Dining\mysql` and `backup\` survive.

## Status

Not yet run against a clean VM. Verified so far on the build machine: every script parses; all
templates render with no unreplaced placeholders and no BOM; the port and password agree across
`my.ini`, `.env`, `config.ini` and `backup.cmd`; the counter app parses a generated `config.ini`;
and the fresh `migrate` + seed path completes against MySQL 8.

Desktop-first / localhost-only change: `Install-Services.ps1`'s `demand`-start config and the
`httpd-dining.conf.tpl` loopback bind were checked directly against the real files (present, and
correctly absent from the old delayed-auto / bare-port forms) — not yet exercised through a full
`stage-payload.ps1` run. The `Start-WebAdmin.ps1` port-detection regex was tested against both the
new `Listen 127.0.0.1:PORT` and the old bare `Listen PORT` forms. The `photos.py` circuit breaker
was tested directly against an unroutable address (RFC 5737 TEST-NET-1): trips after exactly 2
real 3-second timeouts, then short-circuits to near-instant, then recovers after the cooldown and
a successful probe. All three new self-test branches (empty photo folder, HTTP fallback reachable,
HTTP fallback unreachable) were run live and produce the expected line. `python -m pytest tests -q`
still passes (14/14) with no changes needed to the tests themselves.
