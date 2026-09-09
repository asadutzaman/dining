# Installer

Builds `dining-setup.exe` — one file that takes a bare Windows 11 PC to a working dining counter
with **no internet and no pre-installed software**. It replaces the manual procedure in
[../docs/counter-pc-deployment.md](../docs/counter-pc-deployment.md), which remains the reference
for the operator's daily routine (Part 3) and for what the hardware needs.

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

Two Windows services: **DiningMySQL** and **DiningWeb** (Apache + mod_php, `delayed-auto`,
depends on the database). Both have `sc failure` restart policies. There is no `nssm` or `srvany`
anywhere — both servers register themselves.

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
outages rather than as a misconfiguration. Nothing external ever connects — MySQL is bound to
`127.0.0.1` and **no firewall rule is ever created for it**. Only the web port is opened, and only
to `LocalSubnet` on the Domain and Private profiles.

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
scheduled task, the firewall rule, and the uploads junction (`rmdir`, which removes the link and
never the target).

**`C:\ProgramData\Dining\` is kept in full.** Member balances are a running total that nothing
else can reconstruct — there is no ledger — so deleting the data directory loses every member's
outstanding due permanently. The `.iss` carries no catch-all `[UninstallDelete]` for this reason.

Power settings and Windows Update active hours are deliberately not reverted.

## Testing this before it touches a real counter

Use a clean Windows 11 VM and run it **twice**, once per branch:

1. **Fresh:** no `.sql` beside the installer. Expect both services running, the admin login at
   `http://localhost:8000`, three baseline meal rates, and a self-test that is all `[ok]` except
   the printer.
2. **Restore:** with `dining-full.sql`. Expect the real member count, correct token sequence, and
   balances intact.
3. Open `http://<LAN-IP>:8000/admin/dining/meal-token/issue` **from a second PC** and refresh it.
   That is what proves both the SPA fallback route and the origin-derived API config.
4. Run the backup task by hand; confirm a `.sql` larger than 10KB appears.
5. Reboot; confirm both services come up and the counter autostarts.
6. Uninstall; confirm `C:\ProgramData\Dining\mysql` and `backup\` survive.

## Status

Not yet run against a clean VM. Verified so far on the build machine: every script parses; all
templates render with no unreplaced placeholders and no BOM; the port and password agree across
`my.ini`, `.env`, `config.ini` and `backup.cmd`; the counter app parses a generated `config.ini`;
and the fresh `migrate` + seed path completes against MySQL 8.
