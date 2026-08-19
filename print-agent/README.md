# Dining kiosk print agent

Prints meal-token receipts by sending **ESC/POS bytes straight to the thermal printer**, instead
of printing through the browser.

## Why this exists

Chrome's `--kiosk-printing` path rasterizes each 80mm receipt into a full-page image and pushes it
through the Windows GDI spooler. Chrome's print coordinator is scoped to the whole tab and
silently ignores new print requests while it believes one is still in flight, so under kiosk use
printing wedged after roughly 5–6 receipts and only a page reload recovered it.

ESC/POS is ~500 bytes of plain text per receipt. No rasterization, no GDI, no print dialog, and no
per-tab Chrome state to wedge.

The web page falls back to browser printing automatically when this agent is not running, so the
counter never loses the ability to print — it just gets slower and starts reloading again.

## Install on the kiosk PC

```
pip install -r requirements.txt
pyinstaller --onefile --noconsole agent.py --name dining-print-agent
```

Copy `dist/dining-print-agent.exe` anywhere on the kiosk, then put a shortcut to it in the Startup
folder (press `Win+R`, run `shell:startup`). No Python installation is needed on the kiosk itself.

To run it from source instead, just `python agent.py`.

## Configuration

Entirely optional. Without it, the agent uses the Windows **default printer** on port **9101**.
To change either, drop an `agent.ini` next to the exe:

```ini
[agent]
printer = RONGTA 80mm Series Printer
port = 9101
```

CORS is always wide open (`Access-Control-Allow-Origin: *`) and is not configurable. The agent
only ever listens on `127.0.0.1` — that binding, not the `Origin` header, is what keeps it off
the network — so locking CORS to specific origins would add no real protection while creating a
way for printing to silently break the day the dining app's hosting address changes.

## Checking it

```
curl http://127.0.0.1:9101/health
```

```json
{"ok": true, "printer": "RONGTA 80mm Series Printer", "blocking": "", "advisory": "", "jobs": 0}
```

- `blocking` — the printer cannot print (out of paper, cover open, offline). Jobs are refused and the operator is told.
- `advisory` — worth reporting but not fatal. **The Rongta `80Normal` driver sets Windows' vague `PRINTER_STATUS_ERROR` bit even when the printer works**, so that bit is deliberately advisory. Refusing on it would turn "printing wedges occasionally" into "printing never works".
- `jobs` — Windows queue depth. A number that climbs and never falls means jobs are not draining.

To print a real receipt:

```
curl -X POST http://127.0.0.1:9101/print -H "Content-Type: application/json" ^
  -d "{\"token_number\":\"T-0042\",\"meal_type\":\"DINNER\",\"meal_date\":\"2026-08-19\",\"amount\":\"60.00\",\"created_at\":\"2026-08-19 19:30:11\",\"member_name\":\"Test Student\",\"member_code\":\"M-0012\"}"
```

## Troubleshooting

Look at `print-agent.log`, written beside the exe. `--noconsole` hides crashes, so the log is the
only place errors appear.

- **Nothing prints, `blocking` is empty** — check the log, and check `jobs`. A climbing queue means the driver is accepting jobs the printer is not consuming.
- **Stuck jobs** — clear the queue (Settings → Printers → open queue → cancel all). If it recurs, restart the Print Spooler service.
- **Non-English names print as `?`** — ESC/POS text mode is single-byte. Names outside the printer's code page are replaced rather than crashing the job. Printing Bengali text would need image-mode printing, which is a different approach entirely.
- **Antivirus flags the exe** — unsigned PyInstaller binaries are sometimes flagged; whitelist it.

## Receipt layout

48 columns (80mm at Font A). Mirrors the HTML receipt the browser used to produce, field for
field: title, meal (double height), token number (double height + width), name, member code,
date, amount, DUE, issued timestamp, footer, then feed and partial cut.
