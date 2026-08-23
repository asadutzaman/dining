# Dining counter

A single Windows desktop program for the dining hall counter. Double-click it, a full-screen scan
window opens, the operator punches a card, the member's photo and name appear, a meal token is
written **directly to MySQL** and an 80mm receipt prints.

No login, no browser, no Laravel API, no localhost HTTP hop — the three moving parts the old
Chrome-kiosk-plus-print-agent setup needed before anyone could eat.

**Scope is the scan screen only.** Collecting tokens, voiding them, payments, reports and member
enrolment all stay in the existing web admin.

---

## Running it

```
pip install -r requirements.txt
copy config.ini.example config.ini      # then edit it
python main.py
```

| Command | What it does |
|---|---|
| `python main.py` | the counter, full screen |
| `python main.py --windowed` | same, in a normal window (useful while testing) |
| `python main.py --self-test` | preflight checks, no window — **run this first** |
| `python main.py --dry-run` | full screen and full reads, but every token rolls back |
| `python main.py --test-print` | print one sample receipt, no database writes |
| `python main.py --preview out.png` | render a sample receipt to a PNG instead of printing |
| `python main.py --config path.ini` | use a different config file |

`Ctrl+Shift+Q` closes the counter, behind a confirmation — a stray `Esc` must not drop a kiosk to
the desktop.

## Building for the kiosk

```
powershell -ExecutionPolicy Bypass -File build.ps1
```

Copy `dist\dining-counter\` to the kiosk, edit `config.ini` beside the exe, and make a desktop
shortcut to `dining-counter.exe`. Put a second shortcut in `shell:startup` (Win+R) to have it come
up with Windows. **No Python is needed on the kiosk.**

Unsigned PyInstaller executables are sometimes flagged by antivirus; whitelist the folder if that
happens.

## Configuration

`config.ini` sits **beside the exe**, not inside it, so the kiosk can be repointed without a
rebuild. Every key has a working default. See `config.ini.example` for the annotated version.

The one setting you cannot guess is the table prefix:

```ini
[database]
prefix = auth_aq4nl4ag_
```

Every table in this database carries it. It comes from `DB_PREFIX` in `backend/.env` — **not**
from the default in `backend/config/database.php`, which is stale.

`[app] issued_by` is blank by default, which stores `NULL` in `meal_tokens.issued_by`. That is the
honest record for a counter with no login. Set it to a `users.id` if you want every token
attributed to one account.

## Photos

Tried in order, so the screen always shows something:

1. `[photos] root` — a folder holding Laravel's `storage/app/public` tree, either a local copy or
   a UNC share. `files.file_path` is resolved relative to it.
2. `[photos] http_fallback` — `GET {url}/{photo_id}`, the same endpoint the web counter screen
   uses. It carries no auth middleware, so no token is needed.
3. `member_candidates.image_url`, the original NCMS URL.
4. The member's initials on a tile.

Note that `backend\storage\app\public\uploads\Member` on the dev machine holds only a stub — the
real image files live on the API server. Either point `root` at a share, copy the tree down, or
leave `root` blank and rely on the HTTP fallback.

Photos are cached in memory and under `%LOCALAPPDATA%\DiningCounter\photos`, so a repeat scan is
instant and a network blip never stalls the counter.

## Receipts

Rendered as a bitmap by Qt and sent to the Windows spooler as ESC/POS raster (`GS v 0`), RAW —
no GDI, no driver rasterization.

The old print agent used ESC/POS **text** mode, which is single-byte, so a Bengali member name
printed as a row of `?`. Bengali also needs complex shaping (reordered vowel signs, conjunct
ligatures), and the Pillow wheels here are built without Raqm, so Pillow would have placed the
glyphs in the wrong order — legible-looking nonsense, worse than an obvious `?`. Qt bundles
HarfBuzz and shapes correctly with no extra dependency.

Check the layout without burning paper:

```
python main.py --preview receipt.png
```

### Printer troubleshooting

Carried over from the old print agent, which learned these the hard way:

- **`PRINTER_STATUS_ERROR` is treated as advisory, not blocking.** The Rongta `80Normal` driver
  sets that bit even when the printer is perfectly usable. Refusing on it would turn "printing
  wedges occasionally" into "printing never works".
- Genuinely blocking: out of paper, paper jam, cover open, offline, not available, needs
  attention. In those states the job is refused rather than queued, and the screen tells the
  operator the token was issued but **not** printed. The token is committed either way.
- **A queue that climbs and never falls** means the driver is accepting jobs the printer is not
  consuming. Clear it (Settings → Printers → open queue → cancel all) and if it recurs, restart
  the Print Spooler service. `--self-test` warns once five jobs are waiting.
- Errors are logged to `dining-counter.log` beside the exe. `--windowed` builds hide crashes, so
  the log is the only place they appear.

## The audit journal

Every issue, rejection and print result is appended to `counter-journal.jsonl` beside the exe, with
the member's balance before and after.

This exists because `due_balance` is a running total that nothing can re-derive — the schema has no
ledger, and one missed rollback would corrupt a balance silently and permanently. A real ledger
belongs in the shared database, written by both this app and Laravel; that is a change spanning
both writers, not something this app should do unilaterally. The journal at least means the
counter never loses its own side of the story.

## Tests

The tests commit tokens, void them and move balances, so they refuse to run against the live
database. Make a copy first:

```
mysql -u root -e "CREATE DATABASE dining_counter_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysqldump -u root --single-transaction dining ^
  auth_aq4nl4ag_users auth_aq4nl4ag_departments auth_aq4nl4ag_designations ^
  auth_aq4nl4ag_files auth_aq4nl4ag_member_candidates auth_aq4nl4ag_members ^
  auth_aq4nl4ag_meal_settings auth_aq4nl4ag_meal_tokens auth_aq4nl4ag_meal_bookings ^
  auth_aq4nl4ag_code_sequences | mysql -u root dining_counter_test

python -m pytest tests -q
```

Override the target with `DINING_TEST_DB=some_other_copy`.

Covered: walk-in issue charges exactly once; a `BOOKED` booking is settled and charged once at the
price the member was quoted; duplicate, voided, inactive-member, unknown-member, missing-rate and
outside-the-window rejections all leave the balance and the sequence untouched; a meal with no
window has no time restriction; a backdated token is priced at the rate in force on that date; a
dry run leaves nothing behind; and eight simultaneous scans on separate connections never share a
token number.

## What was fixed rather than ported

The build brief (`../docs/meal-token-issue-spec.md` §6) lists five defects in the original. Three
are closed here:

- **Token-number race.** The original read and incremented the sequence as two unlocked
  statements, so two concurrent scans minted the same `TKN-n` and the second died as a 500. Here
  the sequence row is taken with `SELECT ... FOR UPDATE` and held to commit. Covered by
  `tests/test_concurrency.py`.
- **Soft delete versus the unique key.** The original's duplicate pre-check ignored voided
  tokens, but the composite unique index does not — so re-issuing after a void passed the friendly
  check and then died on the constraint. MySQL has no partial unique indexes, so the pre-check
  looks at soft-deleted rows too and returns a message the operator can act on.
- **Booking price divergence.** The original stored `meal_settings.cost` on the token while
  billing `booking.unit_price`, so a mid-period price change made the printed receipt disagree
  with the charge. One authoritative price is now chosen — the booking's snapshot, being what the
  member was quoted — and used for both.

Not addressed here, deliberately:

- **No ledger** (§6.5) — see the journal section above.
- **No backend authorization** (§6.4) — that is about the Laravel API's routes. This app does not
  use them.
