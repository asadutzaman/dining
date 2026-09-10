# Counter PC — deployment and daily operation

> **A packaged installer now exists — see [../installer/README.md](../installer/README.md).**
> `dining-setup.exe` automates everything in Part 1 and Part 2 below, and defaults to a different
> shape than this manual procedure describes: the counter app starts automatically and the web
> admin is installed **stopped**, starting only when opened from its own shortcut, and answering
> only on `127.0.0.1` — never reachable from another PC. Part 1 and Part 2 here remain accurate
> for a **manual** install (no installer, or troubleshooting one that already ran), and that path
> still serves the admin on the network as written below. Part 3 applies either way.

Everything needed to take a **bare Windows 11 PC** (no Python, no Laragon, nothing) and turn it
into the dining counter.

This PC is the whole system: it holds the database, and runs the counter app that scans cards and
prints tokens. Whether the web admin also serves other machines on the network depends on which
path was used to set it up — see the note above.

> **Part 1 and Part 2 are for whoever sets the machine up.**
> **Part 3 is for the counter operator** — print it and keep it by the printer.

---

## What ends up on the machine

```
C:\dining\
    backend\        Laravel API + database config + the member photo folder
    frontend\       the web admin's built files
    counter\        dining-counter.exe + config.ini      <-- the scan screen
    backup\         nightly database dumps
```

| Piece | What it is for | Required? |
|---|---|---|
| **MySQL** (via Laragon) | holds members, tokens, prices, balances | **yes** — the counter app cannot run without it |
| **Counter app** | the scan-and-print screen | **yes** |
| **Rongta printer** | prints the token slip | **yes** |
| **RFID reader** | reads the cards | **yes** |
| **Web admin** (Laravel + frontend) | enrolling members, setting meal prices, reports, collecting payments | **yes, in practice** — the counter app only issues tokens to members who already exist and only for meals that already have a price |

The counter app talks **straight to MySQL**. It does not need the web admin running to issue a
token. But a card that has never been enrolled cannot be enrolled from the counter screen, so in
practice you need both.

---

# Part 1 — Before you leave the office

Do all of this on the development machine, onto a USB stick. It saves you fighting with a slow
counter-room network later.

### 1.1 Build the counter app

```powershell
cd C:\Users\mdasa\OneDrive\Desktop\project\dining\dining\python
powershell -ExecutionPolicy Bypass -File build.ps1
```

Produces `python\dist\dining-counter\` (about 114 MB). **The whole folder is the app** — the exe
alone will not run.

### 1.2 Build the web admin frontend

Do this here so you never need Node.js on the counter PC:

```powershell
cd ..\frontend
npm install
npm run build
```

Output lands in `frontend\build\`.

> Check that `frontend\build\index.html` exists when it finishes. At time of writing the
> `frontend\build` folder in the repo holds only `media\` and `static\` with no `index.html`,
> which means the last build did not complete. If `index.html` is missing, the web admin will
> not load.

### 1.3 Export the database

```powershell
C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe -u root --single-transaction --routines --events dining > D:\dining-deploy\dining-full.sql
```

### 1.4 Collect the member photos — read this, it matters more than it used to

The database has photo records for **147 of 163 members**, but **the image files are not on the
development machine.** `backend\storage\app\public\uploads\Member\` holds only empty stub folders;
the four files actually present are unrelated test images. The real photos live on the API server
that NCMS syncs into.

The counter screen works fine without them — it shows the member's initials on a tile instead —
but the photo is the operator's main check that the right person is at the counter, so it is worth
getting.

**If you deployed with `dining-setup.exe`, this step is no longer optional in practice.** The
counter's photo lookup falls back to the web admin's `/api/file/view/` endpoint when a photo is
not found locally — but the installer leaves the web admin **stopped** by default, so that
fallback normally has nothing behind it, and a member's own `image_url` (the original NCMS
address) is unreachable on a fully offline machine either way. The counter still works with none
of this — a short-lived circuit breaker means an unreachable source costs a few seconds once
rather than on every scan, then it is skipped — but every member without a local photo file will
show as initials for the rest of that run. `dining-counter-cli.exe --self-test` reports this
plainly (`folder is empty, every member will show initials`), so check it after copying the
photos onto the machine, not before.

**Copy `storage\app\public\uploads\Member\` from the API server** onto the USB stick. You can see
exactly which files are expected:

```powershell
cd C:\Users\mdasa\OneDrive\Desktop\project\dining\dining\python
python -c "from dining_counter import config as cm; from dining_counter.db import Database; c=cm.load(); db=Database(c.db); cur=db.connection().cursor(); cur.execute(f'SELECT f.file_path FROM {c.prefix}members m JOIN {c.prefix}files f ON f.file_id=m.photo_id LIMIT 10'); [print(r['file_path']) for r in cur.fetchall()]; db.close()"
```

Each path is relative to `backend\storage\app\public\`, e.g.
`uploads/Member/2026/07/13/24/110/1783960914_24110001.jpg`. Keep the folder structure exactly.

If you cannot get them today, deploy anyway and add them later — it is a file copy, no
reconfiguration.

### 1.5 USB stick checklist

- [ ] `dining-counter\` folder (from `python\dist\`)
- [ ] `dining-full.sql`
- [ ] the whole `backend\` folder, **including `vendor\`** — `vendor\` is gitignored and NOT in
      the repo, so it only exists on a machine where `composer install` has been run. Copy the one
      from your dev machine, or run `composer install --no-dev --optimize-autoloader` before copying.
      There is no PHP or Composer on the counter PC to fix this with later.
- [ ] `frontend\build\` (with `index.html` in it)
- [ ] `uploads\Member\` photos — see §1.4; worth the extra trip if you did not already get them
- [ ] Laragon Full installer — <https://laragon.org/download/>
- [ ] Rongta 80mm printer driver — <https://www.rongtatech.com/> (Support → Downloads)
- [ ] this document

---

# Part 2 — One-time setup on the counter PC

Log in as an **administrator** account.

### Step 1 — Stop Windows going to sleep

A counter PC that sleeps mid-service loses the card reader and stalls the printer queue. In an
**Administrator** PowerShell:

```powershell
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
powercfg /change monitor-timeout-ac 0
powercfg /change disk-timeout-ac 0
```

Then turn off USB power saving, which is what silently kills RFID readers after an idle hour:

**Device Manager → Universal Serial Bus controllers →** for every *USB Root Hub* entry:
right-click → Properties → Power Management → untick **"Allow the computer to turn off this device
to save power"**.

Also set Windows Update to **Active hours 06:00–23:00** so it never reboots during a meal.

### Step 2 — Install Laragon (this gives you MySQL and PHP)

1. Run the Laragon **Full** installer. Accept the default path `C:\laragon`.
2. Launch Laragon, click **Start All**. You should see Apache and MySQL turn green.
3. Right-click the Laragon window → **Preferences → General** → tick **"Run Laragon when Windows
   starts"** and **"Start all services automatically"** (wording varies slightly between versions).
   This matters: if MySQL is not running the counter app shows a red Database dot and refuses every
   scan.
4. Right-click Laragon → **PHP → Version → 8.2** or newer. The backend requires PHP 8.2+.

> **Do not also install MySQL Community Server separately.** Two MySQL instances fighting over
> port 3306 is a confusing failure that looks like random database outages.

### Step 3 — Create and restore the database

Open **Laragon → Terminal** (it puts the MySQL tools on the PATH), then:

```bash
mysql -u root -e "CREATE DATABASE dining CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root dining < D:\dining-deploy\dining-full.sql
```

Check it landed:

```bash
mysql -u root dining -e "SELECT COUNT(*) FROM auth_aq4nl4ag_members; SELECT COUNT(*) FROM auth_aq4nl4ag_meal_tokens;"
```

You should see roughly 163 members. **Every table name starts with `auth_aq4nl4ag_`** — that
prefix comes from `DB_PREFIX` in `backend\.env` and is not optional.

### Step 4 — Copy the project files

Create `C:\dining\` and copy from the USB stick:

| From the stick | To |
|---|---|
| `backend\` | `C:\dining\backend\` |
| `frontend\build\` | `C:\dining\frontend\build\` |
| `dining-counter\` | `C:\dining\counter\` |
| `uploads\Member\` | `C:\dining\backend\storage\app\public\uploads\Member\` |

Then create the backup folder: `C:\dining\backup\`

Edit `C:\dining\backend\.env` and confirm these lines:

```
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=dining
DB_USERNAME=root
DB_PASSWORD=
DB_PREFIX=auth_aq4nl4ag_
```

### Step 5 — Install the printer

1. **Leave the printer unplugged**, run the Rongta driver installer, then plug the USB in and
   power it on.
2. **Settings → Bluetooth & devices → Printers & scanners.** Confirm a printer appears. Note its
   **exact name** — on the development machine it is `RONGTA 80mm Series Printer`. You will paste
   this into `config.ini`.
3. Open it → **Printer properties → Print Test Page.** Something must come out of the printer
   before you go any further. If nothing does, the counter app cannot fix it.
4. Load the paper with the roll feeding from **underneath**, shiny side up. Thermal paper only
   prints on one side.

### Step 6 — Check the RFID reader

The reader is a **keyboard wedge**: it types the card number and presses Enter. No driver needed.

Plug it in, open **Notepad**, and scan a card. You should see something like:

```
0009339858
```

and the cursor jump to the next line.

**The digits must match the database exactly, leading zeros included.** Compare against a real
card:

```bash
mysql -u root dining -e "SELECT member_code, name, rfid_card_number FROM auth_aq4nl4ag_members WHERE rfid_card_number IS NOT NULL LIMIT 5;"
```

If the reader prints fewer digits, or letters, or nothing at all, it is in the wrong output mode
— that is a reader configuration issue (usually a setup barcode in its manual), and no amount of
app configuration will fix it.

### Step 7 — Configure the counter app

Open `C:\dining\counter\config.ini` in Notepad and make it read:

```ini
[database]
host = 127.0.0.1
port = 3306
database = dining
user = root
password =
prefix = auth_aq4nl4ag_

[printer]
enabled = true
name = RONGTA 80mm Series Printer
copies = 1

[photos]
root = C:\dining\backend\storage\app\public
http_fallback = http://127.0.0.1:8000/api/file/view/
font = C:\Windows\Fonts\Nirmala.ttc

[app]
title = COLLEGE DINING
issued_by =
fullscreen = true
result_seconds = 8
meal_poll_seconds = 60
```

Change `name` if your printer is named differently, and `title` to whatever should print at the
top of the slip. Leave `issued_by` blank — there is no login at the counter, so tokens are
recorded with no user attached, which is the honest record.

### Step 8 — Run the self-test

```powershell
C:\dining\counter\dining-counter.exe --self-test
```

Every line must say `[ ok ]` or `[warn]`. **A single `[FAIL]` means do not go live.**

```
Database
  [ ok ] connected to dining@127.0.0.1:3306 as root
  [ ok ] table prefix "auth_aq4nl4ag_" resolves (163 members)
Meal settings
  [ ok ] BREAKFAST Tk 60.00    00:00 - 11:00  (effective 2026-08-05)
  [ ok ] LUNCH     Tk 60.00    11:00 - 16:00  (effective 2026-08-01)
  [ ok ] DINNER    Tk 60.00    16:00 - 23:55  (effective 2026-08-06)
  [ ok ] serving now: LUNCH
Token numbering
  [ ok ] next token will be TKN-107
Printer
  [ ok ] RONGTA 80mm Series Printer ready (0 jobs queued)
  [ ok ] receipt font: Nirmala UI (Qt shapes Bengali via HarfBuzz)
Photos
  [ ok ] folder: C:\dining\backend\storage\app\public
```

`[warn] between sittings` is fine — it just means no meal is being served at this moment.

### Step 9 — Print a real token

```powershell
C:\dining\counter\dining-counter.exe --test-print
```

A slip should come out with a Bengali name on it. Check that **the token number is the biggest
thing on the paper** — that is what the food counter reads — and that the paper cuts.

### Step 10 — Make the desktop shortcut

1. Right-click `C:\dining\counter\dining-counter.exe` → **Show more options → Send to → Desktop
   (create shortcut)**.
2. Rename the shortcut to **Dining Counter**.
3. Right-click it → Properties → **Change Icon** if you want something more obvious.
4. Drag it to a corner of the desktop on its own, away from anything else.

**Double-click it now.** The scan screen should fill the display. Scan a real card. A token should
print.

Close it with **Ctrl+Shift+Q** (it asks for confirmation first, so a stray key press cannot drop
the counter to the desktop).

### Step 11 — Nightly database backup

Balances are a running total that nothing else can reconstruct. Without a backup, a failed disk is
the loss of every member's outstanding due.

Create `C:\dining\backup\backup.bat`:

```bat
@echo off
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set STAMP=%%i
"C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe" -u root --single-transaction --routines --events dining > "C:\dining\backup\dining-%STAMP%.sql"
forfiles /P "C:\dining\backup" /M dining-*.sql /D -30 /C "cmd /c del @path" 2>nul
```

Keeps 30 days and deletes older dumps. The `2>nul` swallows the "No files found" message
`forfiles` prints for the first month, when nothing is old enough to delete yet — it is not an
error.

(Check the MySQL folder name matches what Laragon actually installed.)

> The date is taken from PowerShell rather than `%DATE%` on purpose. `%DATE%` is formatted
> according to the PC's regional settings, so the usual `%DATE:~-4%` trick produces a different
> string — sometimes an invalid filename — on a machine set to a different region, and it fails
> silently.

Then **Task Scheduler → Create Basic Task**: name it `Dining DB backup`, trigger **Daily at
23:30**, action **Start a program** → `C:\dining\backup\backup.bat`. Tick **"Run whether user is
logged on or not."**

Run it once by hand and confirm a `.sql` file appears that is more than a few KB.

> Copy these off the machine periodically — a backup on the same disk as the database is not a
> backup.

### Step 12 — The web admin (for enrolment and prices)

> This manual path serves the admin to the whole network, on purpose — that is what
> `--host=0.0.0.0` does. If you meant to keep it counter-PC-only, as `dining-setup.exe` does by
> default, use the installer instead of this section.

Open **Laragon → Terminal**:

```bash
cd C:\dining\backend
php artisan serve --host=0.0.0.0 --port=8000
```

The admin is then reachable at `http://<counter-pc-ip>:8000` from any PC on the network. Find the
IP with `ipconfig`.

To keep it running without a terminal window open, create a shortcut to:

```
C:\laragon\bin\php\php-8.2.21-Win32-vs16-x64\php.exe artisan serve --host=0.0.0.0 --port=8000
```

with **Start in** set to `C:\dining\backend`, and put it in the Startup folder (`Win+R` →
`shell:startup`). Adjust the PHP folder name to the version Laragon installed.

Leaving `http://127.0.0.1:8000` in `config.ini` as the photo fallback means that once this is
running, any member photo missing from the local folder is fetched through it automatically.

### Step 13 — Optional hardening

This PC now serves the database and the admin to the rest of the network, and MySQL's `root`
account has no password. MySQL's default `root` only accepts connections from the machine itself,
so this is not wide open — but if you want it tightened:

```bash
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'a-strong-password';"
```

Then put that password in **both** `C:\dining\backend\.env` (`DB_PASSWORD=`) and
`C:\dining\counter\config.ini` (`password =`), and re-run the self-test.

---

# Part 3 — Everyday operation

**For the counter operator. Print this page.**

## Starting up each morning

1. Turn the PC on and let it finish loading.
2. Turn the **printer** on. Check there is paper.
3. Double-click **Dining Counter** on the desktop.
4. Wait for the screen to say **"Punch your card"**.
5. Check the two lights at the top right are both **green**:
   - **Database** — green means tokens can be issued
   - **Printer** — green means slips will print
6. Check the box at the top centre shows the right meal (**Breakfast / Lunch / Dinner**) and the
   price.

If both lights are green and the meal is right, you are ready. **Scan one test card** before the
queue arrives.

## Issuing a token

Just scan the card. Nothing else to press.

The screen shows the member's **photo and name** — check the face matches the person in front of
you — and then a **green box with the token number**. The slip prints on its own.

Hand over the slip. Scan the next card.

The screen clears itself after about 8 seconds. You never need to clear it.

> **Do not click anywhere on the screen.** The card reader types into the app, and clicking
> elsewhere can take that away. If scanning suddenly does nothing, click once on the **card box at
> the bottom** and carry on.

## What the messages mean

| The screen says | What happened | What to do |
|---|---|---|
| **Still loading the current meal** | app only just opened | wait a moment, scan again |
| **No meal is being served right now** | it is between sittings | check the clock; if the time is right, meal times need fixing in the admin |
| **Card not recognised** | this card is not linked to anyone | send them to the office to be enrolled |
| **Member not found or inactive!** | their account is switched off | send them to the office |
| **A token has already been issued to this member for this meal today!** | they already collected one | they have had this meal — nothing more to do |
| **A token for this meal was voided earlier** | a cancelled token is blocking it | the office has to sort this one out |
| **No active cost setting found for this meal type!** | no price is set for this meal | tell the office — no tokens can be issued until it is set |
| **Lunch can only be issued between 11:00 and 16:00!** | outside serving hours | the meal is closed; the office can change the hours |
| **Number Sequence not found!** | token numbering is broken | call IT — nothing will work until it is fixed |
| **Token issued but NOT printed** | the token is **saved**, but the printer failed | see below |
| **Database unavailable** | the database has stopped | see below |

## Token issued but NOT printed

**The member has been charged and the token is valid.** Only the paper is missing.

1. **Write the token number down** and give it to the member — the food counter accepts it.
2. Then fix the printer: check the paper, check the cover is properly shut, check it is switched
   on.
3. The **Printer light** goes back to green when it recovers.

Do **not** scan the card again — you will get "already issued", because they have their token.

## Database unavailable

Nothing can be issued while this shows.

1. Close the app (**Ctrl+Shift+Q**).
2. Find the **Laragon** icon near the clock, open it, click **Start All**, and wait for MySQL to
   go green.
3. Reopen **Dining Counter**.
4. Still red after that? **Restart the PC.** Still red? Call IT.

## Nothing happens when I scan

1. Click once on the **card box at the bottom of the screen**, then scan again.
2. Still nothing? Open **Notepad** and scan — if no numbers appear there either, the reader is
   unplugged or faulty. Try a different USB port.
3. Numbers appear in Notepad but not in the app? Close and reopen **Dining Counter**.

## The photo is just letters in a box

That member has no photo file on this PC. **Everything else works normally** — carry on issuing.
Mention it to IT and they can add the photos later.

## Closing down

Press **Ctrl+Shift+Q** and confirm. Turn the printer off.

Leaving the app running overnight is fine — it rolls over from one meal to the next by itself.

---

# Troubleshooting for IT

| Symptom | Cause | Fix |
|---|---|---|
| Red Database light | MySQL not running | Laragon → Start All. Make sure Laragon's "start automatically" preference is on, or this recurs at every reboot |
| Self-test: `table prefix ... is wrong` | `prefix` in `config.ini` does not match the restored DB | must be `auth_aq4nl4ag_` |
| Self-test: `no active rate` | `meal_settings` has no row effective on or before today | set the meal price in the web admin |
| Amber Printer light, jobs climbing | driver accepting jobs the printer never prints | Printers → open queue → Cancel All. If it recurs, restart the **Print Spooler** service |
| `printer reports an error` in the self-test | the Rongta `80Normal` driver sets this bit even when healthy | **ignore it** — it is reported as advisory on purpose. Refusing on it would stop printing altogether |
| Bengali names print as boxes | the receipt font is missing | check `C:\Windows\Fonts\Nirmala.ttc` exists; it ships with Windows |
| Every photo shows initials | photo files not on this PC | copy `uploads\Member\` into `C:\dining\backend\storage\app\public\`, or start the web admin so the HTTP fallback works |
| Cards read in Notepad but never match a member | reader dropping leading zeros or using a different format | compare against `rfid_card_number` in the database; reconfigure the reader |
| Antivirus quarantines the exe | unsigned PyInstaller build | whitelist `C:\dining\counter\` |
| App will not start at all | crash before the window opens | read `C:\dining\counter\dining-counter.log` |

### Where the evidence is

- `C:\dining\counter\dining-counter.log` — errors and crashes.
- `C:\dining\counter\counter-journal.jsonl` — **one line per token, rejection and print**, with the
  member's balance before and after. This is what settles a dispute about whether someone was
  charged twice.

### Testing without affecting real data

```powershell
dining-counter.exe --dry-run
```

Full screen, real members, real prices — but every token is rolled back and nothing is charged.
Good for training a new operator.

### After changing config.ini

Always re-run `dining-counter.exe --self-test` and then restart the app. The file is only read at
startup.
