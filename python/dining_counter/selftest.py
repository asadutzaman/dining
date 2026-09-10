"""
Preflight diagnostics.

Run this on the kiosk before a sitting, or the first time config.ini is edited. It answers the
question the operator will otherwise discover at the counter with a queue waiting: is everything
this app depends on actually reachable?
"""

import datetime as dt
import sys

from . import config as config_module
from .db import Database
from .meals import detect, fmt_time
from .repository import MEAL_TYPES, Repository

PASS = '  [ ok ] '
FAIL = '  [FAIL] '
WARN = '  [warn] '


def _line(marker, text):
    print(marker + text)


def run(config=None):
    config = config or config_module.load()
    failures = 0

    print()
    print('Dining counter self-test')
    print('config: %s' % config.path)
    print('-' * 68)

    # --- database -----------------------------------------------------------------------------
    print('Database')
    db = Database(config.db)
    repo = Repository(config.prefix)
    try:
        db.check()
        _line(PASS, 'connected to %s@%s:%s as %s' % (
            config.db['database'], config.db['host'], config.db['port'], config.db['user']))
    except Exception as exc:
        _line(FAIL, 'cannot connect: %s' % exc)
        print()
        print('Nothing else can be checked without the database.')
        return 1

    try:
        with db.read() as cur:
            cur.execute('SELECT COUNT(*) AS n FROM %smembers' % config.prefix)
            count = cur.fetchone()['n']
        _line(PASS, 'table prefix "%s" resolves (%d members)' % (config.prefix, count))
    except Exception as exc:
        _line(FAIL, 'table prefix "%s" is wrong: %s' % (config.prefix, exc))
        failures += 1

    # --- pricing and windows ------------------------------------------------------------------
    print('Meal settings')
    today = dt.date.today()
    try:
        with db.read() as cur:
            for meal in MEAL_TYPES:
                row = repo.effective_setting(cur, meal, today)
                if not row:
                    _line(FAIL, '%-9s no active rate for %s' % (meal, today))
                    failures += 1
                    continue
                window = ('%s - %s' % (fmt_time(row['start_time']), fmt_time(row['end_time']))
                          if row['start_time'] and row['end_time'] else 'no time restriction')
                _line(PASS, '%-9s Tk %-8s %s  (effective %s)' % (
                    meal, row['cost'], window, row['effective_from']))
    except Exception as exc:
        _line(FAIL, 'could not read meal settings: %s' % exc)
        failures += 1

    try:
        status = detect(db, repo)
        if not status.windows_configured:
            _line(WARN, 'no serving windows configured - the screen will show a manual picker')
        elif status.meal_type:
            _line(PASS, 'serving now: %s' % status.meal_type)
        else:
            _line(WARN, 'between sittings - no meal is being served right now')
    except Exception as exc:
        _line(FAIL, 'current-meal detection failed: %s' % exc)
        failures += 1

    # --- token numbering ----------------------------------------------------------------------
    print('Token numbering')
    try:
        with db.read() as cur:
            cur.execute(
                "SELECT prefix, `separator`, next_sequence FROM %scode_sequences "
                "WHERE label = 'MEAL_TOKEN' AND status = 1 AND deleted_at IS NULL "
                "ORDER BY id LIMIT 1" % config.prefix)
            row = cur.fetchone()
        if row:
            _line(PASS, 'next token will be %s%s%d' % (
                row['prefix'], row['separator'], int(row['next_sequence'])))
        else:
            _line(FAIL, 'no active MEAL_TOKEN row in code_sequences')
            failures += 1
    except Exception as exc:
        _line(FAIL, 'could not read code_sequences: %s' % exc)
        failures += 1

    # --- printer ------------------------------------------------------------------------------
    print('Printer')
    try:
        from .printing import ensure_qt, printer_state, resolve_family, resolve_printer
        if not config.printer_enabled:
            _line(WARN, 'printing is disabled in config.ini')
        name = resolve_printer(config.printer_name)
        state = printer_state(name)
        if state['blocking']:
            _line(FAIL, '%s: %s' % (name, state['blocking']))
            failures += 1
        elif state['advisory']:
            _line(WARN, '%s: %s' % (name, state['advisory']))
        else:
            _line(PASS, '%s ready (%d jobs queued)' % (name, state['jobs']))

        ensure_qt()
        family = resolve_family(config.font_path)
        _line(PASS, 'receipt font: %s (Qt shapes Bengali via HarfBuzz)' % family)
    except Exception as exc:
        _line(FAIL, 'printer check failed: %s' % exc)
        failures += 1

    # --- photos -------------------------------------------------------------------------------
    print('Photos')
    import os
    if not config.photo_root:
        _line(WARN, 'no photo folder configured - the HTTP fallback will be used')
    elif not os.path.isdir(config.photo_root):
        _line(WARN, 'folder not found: %s' % config.photo_root)
    else:
        # A folder existing is not the same as it holding anything. On a fresh install, or one
        # where the member photo copy step was skipped, this resolves to an empty tree silently
        # -- the counter still runs, it just shows initials for every single member, which is
        # easy to mistake for a bug rather than for missing data.
        has_files = any(
            files for _root, _dirs, files in os.walk(config.photo_root))
        if has_files:
            _line(PASS, 'folder: %s' % config.photo_root)
        else:
            _line(WARN, 'folder is empty, every member will show initials: %s' % config.photo_root)

    if not config.photo_http:
        _line(WARN, 'no http fallback configured')
    else:
        # Reachability, not just configuration. On a fully local install the web admin is off by
        # default (see docs/counter-pc-deployment.md), so this URL normally has nothing behind
        # it at all -- that is fine and expected, but it should read as a WARN the operator can
        # recognise, not a PASS that turns out to mean nothing at counter time.
        try:
            import requests
            requests.head(config.photo_http, timeout=2.0)
            _line(PASS, 'http fallback reachable: %s' % config.photo_http)
        except Exception:
            _line(WARN, 'http fallback configured but not reachable right now (normal if the '
                        'web admin is not open): %s' % config.photo_http)

    print('-' * 68)
    if failures:
        print('%d check(s) failed. The counter will not work correctly until these are fixed.'
              % failures)
    else:
        print('All checks passed.')
    print()
    db.close()
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(run())
