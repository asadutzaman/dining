"""
The issue algorithm.

The whole sequence runs inside one transaction; any rejection rolls the lot back. Every
IssueError message is operator-facing copy shown verbatim on the counter screen, not a developer
log line.

Lock order is always member -> sequence -> booking. Consistent ordering is what stops two
counters deadlocking against each other.
"""

import datetime as dt
import decimal
import logging

import pymysql

from .meals import as_time, fmt_time, in_window
from .repository import MEAL_LABEL

log = logging.getLogger('dining-counter.issue')

DUPLICATE_MESSAGE = 'A token has already been issued to this member for this meal today!'
VOIDED_MESSAGE = ('A token for this meal was voided earlier - it cannot be re-issued at the '
                  'counter. Ask the admin office to restore it.')


class IssueError(Exception):
    """A rejection with a message meant for the operator's eyes."""


def issue_token(db, repo, config, member_id, meal_type, meal_date=None, dry_run=False,
                printer_test=False):
    """
    Issue one meal token and return everything the receipt and the screen need.

    Always a DUE token: cash-at-counter goes through the payments flow in the admin app, not here.

    `printer_test` is for testing the printer against a real card. It runs every read and every
    validation, builds a real receipt from real member data, and writes NOTHING: no token row, no
    sequence advance, no balance change, no booking settlement.

    It has to skip the duplicate guard as well as the write. A dry run alone is not enough --
    rollback stops a NEW token persisting, but the guard reads rows that are already committed, so
    the second test scan of a card that has eaten today is rejected before it ever reaches the
    printer. And skipping only the guard would not help either: the INSERT would then collide with
    the same composite unique index the guard exists to explain. Not writing at all is what makes
    one card printable over and over.
    """
    if printer_test and not dry_run:
        # The caller wires these together; refuse rather than trust it. Skipping the duplicate
        # guard on a run that COMMITS is exactly the double-charge this check exists to prevent.
        raise ValueError('printer_test requires dry_run')

    meal_date = meal_date or dt.date.today()
    now = dt.datetime.now()

    with db.transaction(dry_run=dry_run) as cur:
        # 1. The member, locked so a concurrent scan cannot interleave with the balance update.
        member = repo.lock_member(cur, member_id)
        if not member or int(member['status']) != 1:
            raise IssueError('Member not found or inactive!')

        # 2. Duplicate guard. Looks at soft-deleted rows too: the composite unique index does not
        #    exclude them, so without this a re-issue after a void would die on the constraint
        #    instead of explaining itself.
        if not printer_test:
            existing = repo.existing_token(cur, member_id, meal_type, meal_date)
            if existing:
                raise IssueError(VOIDED_MESSAGE if existing['deleted_at'] else DUPLICATE_MESSAGE)

        # 3. The rate in force on the meal date.
        setting = repo.effective_setting(cur, meal_type, meal_date)
        if not setting:
            raise IssueError('No active cost setting found for this meal type!')

        # 4. Serving window -- enforced only when both bounds are set.
        start = as_time(setting['start_time'])
        end = as_time(setting['end_time'])
        if start is not None and end is not None:
            if not in_window(now.time(), start, end):
                raise IssueError('%s can only be issued between %s and %s!' % (
                    MEAL_LABEL.get(meal_type, meal_type), fmt_time(start), fmt_time(end)))

        # 5. Mint the token number. The row lock is held to COMMIT, so the number is unique even
        #    when two counters punch at the same instant.
        sequence = repo.lock_sequence(cur)
        if not sequence:
            raise IssueError('Number Sequence not found!')
        token_number = '%s%s%d' % (
            sequence['prefix'], sequence['separator'], int(sequence['next_sequence']))

        # 6. Does a pre-booking own this meal?
        booking = repo.lock_booking(cur, member_id, meal_date, meal_type)
        booked = booking is not None and booking['booking_status'] == 'BOOKED'

        # 7. One authoritative price. A booking's unit_price is what the member was quoted, so it
        #    wins -- and it goes into both the token amount and the balance, which is what keeps
        #    the printed receipt agreeing with the charge across a price change.
        amount = decimal.Decimal(str(booking['unit_price'])) if booked \
            else decimal.Decimal(str(setting['cost']))

        # 8. The token itself -- skipped entirely for a printer test, which is what keeps the
        #    same card printable: no INSERT means no collision with the composite unique index.
        if printer_test:
            created_at = now.strftime('%Y-%m-%d %H:%M:%S')
            due_before = decimal.Decimal(str(member['due_balance']))
            return {
                'token_id': None,
                'token_number': token_number,
                'member_id': member_id,
                'member_name': member['name'],
                'member_code': member['member_code'],
                'meal_type': meal_type,
                'meal_date': meal_date.strftime('%Y-%m-%d'),
                'amount': '%.2f' % amount,
                'created_at': created_at,
                'from_booking': booked,
                'due_before': '%.2f' % due_before,
                # Nothing was charged. Report the balance unchanged rather than the total this
                # meal would have produced -- the screen must not imply a debt that is not there.
                'due_after': '%.2f' % due_before,
                'dry_run': True,
                'printer_test': True,
            }

        try:
            token_id = repo.insert_token(
                cur,
                token_number=token_number,
                member_id=member_id,
                meal_type=meal_type,
                meal_date=meal_date,
                amount=amount,
                payment_status='DUE',
                payment_method=None,
                issued_by=config.issued_by,
                created_by=config.issued_by,
            )
        except pymysql.err.IntegrityError as exc:
            # Belt and braces: the pre-checks above should have caught both of these.
            code = exc.args[0] if exc.args else 0
            if code == 1062:
                message = str(exc)
                if 'token_number' in message:
                    raise IssueError('Token number collision - please scan again.') from exc
                raise IssueError(DUPLICATE_MESSAGE) from exc
            raise
        if not token_id:
            raise IssueError('Token issuance failed!')

        repo.advance_sequence(cur, sequence['id'])

        # 9. Post the charge down exactly one path. Running both double-bills the member.
        if booked:
            repo.settle_booking(cur, booking['id'], token_id, amount)
        repo.add_due(cur, member_id, amount)

        created_at = now.strftime('%Y-%m-%d %H:%M:%S')
        due_before = decimal.Decimal(str(member['due_balance']))

    return {
        'token_id': token_id,
        'token_number': token_number,
        'member_id': member_id,
        'member_name': member['name'],
        'member_code': member['member_code'],
        'meal_type': meal_type,
        'meal_date': meal_date.strftime('%Y-%m-%d'),
        'amount': '%.2f' % amount,
        'created_at': created_at,
        'from_booking': booked,
        'due_before': '%.2f' % due_before,
        'due_after': '%.2f' % (due_before + amount),
        'dry_run': dry_run,
    }
