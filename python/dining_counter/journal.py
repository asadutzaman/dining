"""
Local append-only audit trail.

`due_balance` is a running total that nothing can re-derive -- the schema has no ledger, and one
missed rollback corrupts a member's balance silently and permanently. A proper ledger belongs in
the shared database, written by both this app and Laravel, and that is not this app's call to
make on its own.

What this app can do is never lose its own side of the story: one JSON line per attempt, with the
balance before and after and what the printer did. It is enough to reconstruct a disputed evening.
"""

import json
import logging
import os
import threading
from datetime import datetime

from .config import app_dir

log = logging.getLogger('dining-counter.journal')

_lock = threading.Lock()


def _path():
    return os.path.join(app_dir(), 'counter-journal.jsonl')


def record(event, **fields):
    entry = {'at': datetime.now().isoformat(timespec='seconds'), 'event': event}
    entry.update(fields)
    line = json.dumps(entry, ensure_ascii=False, default=str)
    try:
        with _lock:
            with open(_path(), 'a', encoding='utf-8') as handle:
                handle.write(line + '\n')
    except OSError:
        # The journal must never be the reason a member cannot eat.
        log.warning('could not append to the journal', exc_info=True)


def issued(card, receipt):
    record('issued',
           card=card,
           member_id=receipt.get('member_id'),
           member_code=receipt.get('member_code'),
           token_number=receipt.get('token_number'),
           meal_type=receipt.get('meal_type'),
           meal_date=receipt.get('meal_date'),
           amount=receipt.get('amount'),
           from_booking=receipt.get('from_booking'),
           due_before=receipt.get('due_before'),
           due_after=receipt.get('due_after'),
           dry_run=receipt.get('dry_run'))


def printed(token_number, result):
    record('printed',
           token_number=token_number,
           ok=bool(result.get('ok')),
           printer=result.get('printer'),
           blocking=result.get('blocking'),
           advisory=result.get('advisory'),
           error=result.get('error'))


def rejected(card, member_id, meal_type, message):
    record('rejected', card=card, member_id=member_id, meal_type=meal_type, message=message)
