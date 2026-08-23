"""
Acceptance tests for the issue algorithm.

These run against a *copy* of the dining database, never the live one -- they commit, void and
re-issue tokens and move real balances around. Point them at a copy with:

    python -m pytest tests -q
    DINING_TEST_DB=my_copy python -m pytest tests -q

Create the copy with mysqldump; see README.md.
"""

import datetime as dt
import decimal
import os
import sys
import uuid

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dining_counter import config as config_module          # noqa: E402
from dining_counter.db import Database                      # noqa: E402
from dining_counter.issue import IssueError, issue_token    # noqa: E402
from dining_counter.repository import Repository            # noqa: E402

TEST_DB = os.environ.get('DINING_TEST_DB', 'dining_counter_test')
PREFIX = os.environ.get('DINING_TEST_PREFIX', 'auth_aq4nl4ag_')


class FakeConfig:
    """Just the fields issue_token reads."""
    issued_by = None
    title = 'TEST DINING'


@pytest.fixture(scope='session')
def wiring():
    base = config_module.load()
    settings = dict(base.db)
    settings['database'] = TEST_DB
    db = Database(settings)
    try:
        db.check()
    except Exception as exc:                                    # pragma: no cover
        pytest.skip('test database %s unavailable: %s' % (TEST_DB, exc))
    if settings['database'] == base.db['database']:             # pragma: no cover
        pytest.fail('refusing to run against the live database')
    yield db, Repository(PREFIX), FakeConfig()
    db.close()


# --- helpers -----------------------------------------------------------------------------------

def _exec(db, sql, params=None):
    with db.transaction() as cur:
        cur.execute(sql, params or ())
        return cur.lastrowid


def _one(db, sql, params=None):
    with db.read() as cur:
        cur.execute(sql, params or ())
        return cur.fetchone()


@pytest.fixture
def member(wiring):
    """A throwaway member, removed afterwards along with anything issued to them."""
    db, _repo, _config = wiring
    tag = uuid.uuid4().hex[:8]
    member_id = _exec(db, f"""
        INSERT INTO {PREFIX}members (uuid, member_code, rfid_card_number, member_type, name,
                                     due_balance, created_at, updated_at, status)
        VALUES (%s, %s, %s, 'STAFF', %s, 0.00, NOW(), NOW(), 1)
    """, (str(uuid.uuid4()), 'TEST-%s' % tag, 'CARD-%s' % tag, 'Test Member %s' % tag))
    yield member_id
    _exec(db, f"DELETE FROM {PREFIX}meal_bookings WHERE member_id = %s", (member_id,))
    _exec(db, f"DELETE FROM {PREFIX}meal_tokens WHERE member_id = %s", (member_id,))
    _exec(db, f"DELETE FROM {PREFIX}members WHERE id = %s", (member_id,))


@pytest.fixture
def open_meal(wiring):
    """
    A meal type whose window is wide open right now, so window enforcement never makes these
    tests time-dependent. Cleaned up afterwards.
    """
    db, _repo, _config = wiring
    meal = 'LUNCH'
    effective = dt.date.today()
    setting_id = _exec(db, f"""
        INSERT INTO {PREFIX}meal_settings (uuid, meal_type, cost, start_time, end_time,
                                           effective_from, created_at, updated_at, status)
        VALUES (%s, %s, 60.00, '00:00:00', '23:59:59', %s, NOW(), NOW(), 1)
        ON DUPLICATE KEY UPDATE cost = 60.00, start_time = '00:00:00', end_time = '23:59:59',
                                status = 1
    """, (str(uuid.uuid4()), meal, effective))
    yield meal, decimal.Decimal('60.00')
    _exec(db, f"DELETE FROM {PREFIX}meal_settings WHERE meal_type = %s AND effective_from = %s",
          (meal, effective))


def due_of(db, member_id):
    return decimal.Decimal(str(_one(
        db, f"SELECT due_balance FROM {PREFIX}members WHERE id = %s", (member_id,))['due_balance']))


def sequence_now(db):
    return int(_one(db, f"SELECT next_sequence FROM {PREFIX}code_sequences "
                        f"WHERE label = 'MEAL_TOKEN' AND status = 1 AND deleted_at IS NULL "
                        f"ORDER BY id LIMIT 1")['next_sequence'])


def make_booking(db, member_id, meal, price, status='BOOKED'):
    return _exec(db, f"""
        INSERT INTO {PREFIX}meal_bookings (uuid, member_id, meal_date, meal_type, unit_price,
                                           booking_status, charge_status, charged_amount, source,
                                           booked_at, created_at, updated_at, status)
        VALUES (%s, %s, %s, %s, %s, %s, 'PENDING', 0.00, 'APP', NOW(), NOW(), NOW(), 1)
    """, (str(uuid.uuid4()), member_id, dt.date.today(), meal, price, status))


# --- happy paths --------------------------------------------------------------------------------

def test_walk_in_issues_and_charges_once(wiring, member, open_meal):
    db, repo, config = wiring
    meal, cost = open_meal
    before = due_of(db, member)

    receipt = issue_token(db, repo, config, member, meal)

    assert receipt['token_number'].startswith('TKN-')
    assert decimal.Decimal(receipt['amount']) == cost
    assert due_of(db, member) - before == cost

    row = _one(db, f"SELECT * FROM {PREFIX}meal_tokens WHERE token_number = %s",
               (receipt['token_number'],))
    assert row['collection_status'] == 'ISSUED'
    assert row['payment_status'] == 'DUE'
    assert row['payment_method'] is None      # never set for a DUE token
    assert row['issued_by'] is None           # no login at the counter
    assert row['uuid'] and row['created_at']  # neither has a DB default


def test_sequence_advances_by_exactly_one(wiring, member, open_meal):
    db, repo, config = wiring
    meal, _cost = open_meal
    before = sequence_now(db)
    receipt = issue_token(db, repo, config, member, meal)
    assert receipt['token_number'] == 'TKN-%d' % before
    assert sequence_now(db) == before + 1


def test_booking_is_settled_and_charged_once(wiring, member, open_meal):
    db, repo, config = wiring
    meal, _cost = open_meal
    quoted = decimal.Decimal('45.00')          # deliberately not the current rate
    booking_id = make_booking(db, member, meal, quoted)
    before = due_of(db, member)

    receipt = issue_token(db, repo, config, member, meal)

    booking = _one(db, f"SELECT * FROM {PREFIX}meal_bookings WHERE id = %s", (booking_id,))
    assert booking['booking_status'] == 'CONSUMED'
    assert booking['charge_status'] == 'CHARGED'
    assert decimal.Decimal(str(booking['charged_amount'])) == quoted
    assert booking['settled_at'] is not None

    token = _one(db, f"SELECT * FROM {PREFIX}meal_tokens WHERE id = %s", (booking['meal_token_id'],))
    assert token['token_number'] == receipt['token_number']

    # Charged exactly once, and the token agrees with what the member was quoted -- the price
    # asymmetry the original shipped would have billed 45 while printing 60.
    assert due_of(db, member) - before == quoted
    assert decimal.Decimal(str(token['amount'])) == quoted
    assert decimal.Decimal(receipt['amount']) == quoted


def test_cancelled_booking_falls_back_to_walk_in_price(wiring, member, open_meal):
    db, repo, config = wiring
    meal, cost = open_meal
    make_booking(db, member, meal, decimal.Decimal('45.00'), status='CANCELLED')
    before = due_of(db, member)

    receipt = issue_token(db, repo, config, member, meal)

    assert decimal.Decimal(receipt['amount']) == cost
    assert due_of(db, member) - before == cost


# --- rejections ---------------------------------------------------------------------------------

def test_duplicate_is_rejected(wiring, member, open_meal):
    db, repo, config = wiring
    meal, cost = open_meal
    issue_token(db, repo, config, member, meal)
    after_first = due_of(db, member)
    sequence_after_first = sequence_now(db)

    with pytest.raises(IssueError) as caught:
        issue_token(db, repo, config, member, meal)
    assert 'already been issued' in str(caught.value)

    # Nothing moved on the rejection.
    assert due_of(db, member) == after_first
    assert sequence_now(db) == sequence_after_first


def test_voided_token_gives_a_readable_message_not_an_integrity_error(wiring, member, open_meal):
    db, repo, config = wiring
    meal, _cost = open_meal
    receipt = issue_token(db, repo, config, member, meal)
    _exec(db, f"UPDATE {PREFIX}meal_tokens SET deleted_at = NOW() WHERE token_number = %s",
          (receipt['token_number'],))

    with pytest.raises(IssueError) as caught:
        issue_token(db, repo, config, member, meal)
    assert 'voided' in str(caught.value).lower()


def test_inactive_member_is_rejected(wiring, member, open_meal):
    db, repo, config = wiring
    meal, _cost = open_meal
    _exec(db, f"UPDATE {PREFIX}members SET status = 0 WHERE id = %s", (member,))
    with pytest.raises(IssueError) as caught:
        issue_token(db, repo, config, member, meal)
    assert 'not found or inactive' in str(caught.value)


def test_unknown_member_is_rejected(wiring, open_meal):
    db, repo, config = wiring
    meal, _cost = open_meal
    with pytest.raises(IssueError) as caught:
        issue_token(db, repo, config, 99999999, meal)
    assert 'not found or inactive' in str(caught.value)


def test_meal_without_a_rate_is_rejected(wiring, member):
    db, repo, config = wiring
    # A date before any effective_from row exists.
    with pytest.raises(IssueError) as caught:
        issue_token(db, repo, config, member, 'LUNCH', meal_date=dt.date(2000, 1, 1))
    assert 'No active cost setting' in str(caught.value)


def test_outside_the_serving_window_is_rejected(wiring, member):
    db, repo, config = wiring
    effective = dt.date.today()
    # A window that closed a minute ago, so "now" is always outside it.
    closed = (dt.datetime.now() - dt.timedelta(minutes=2)).time().strftime('%H:%M:%S')
    opened = (dt.datetime.now() - dt.timedelta(minutes=5)).time().strftime('%H:%M:%S')
    _exec(db, f"""
        INSERT INTO {PREFIX}meal_settings (uuid, meal_type, cost, start_time, end_time,
                                           effective_from, created_at, updated_at, status)
        VALUES (%s, 'DINNER', 60.00, %s, %s, %s, NOW(), NOW(), 1)
        ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time),
                                status = 1
    """, (str(uuid.uuid4()), opened, closed, effective))
    try:
        with pytest.raises(IssueError) as caught:
            issue_token(db, repo, config, member, 'DINNER')
        message = str(caught.value)
        assert 'Dinner can only be issued between' in message
        assert closed[:5] in message          # the window is named, trimmed to HH:MM
    finally:
        _exec(db, f"DELETE FROM {PREFIX}meal_settings WHERE meal_type = 'DINNER' "
                  f"AND effective_from = %s", (effective,))


def test_meal_with_no_window_has_no_time_restriction(wiring, member):
    db, repo, config = wiring
    effective = dt.date.today()
    _exec(db, f"""
        INSERT INTO {PREFIX}meal_settings (uuid, meal_type, cost, start_time, end_time,
                                           effective_from, created_at, updated_at, status)
        VALUES (%s, 'BREAKFAST', 35.00, NULL, NULL, %s, NOW(), NOW(), 1)
        ON DUPLICATE KEY UPDATE cost = 35.00, start_time = NULL, end_time = NULL, status = 1
    """, (str(uuid.uuid4()), effective))
    try:
        receipt = issue_token(db, repo, config, member, 'BREAKFAST')
        assert decimal.Decimal(receipt['amount']) == decimal.Decimal('35.00')
    finally:
        _exec(db, f"DELETE FROM {PREFIX}meal_settings WHERE meal_type = 'BREAKFAST' "
                  f"AND effective_from = %s", (effective,))


# --- pricing ------------------------------------------------------------------------------------

def test_backdated_token_uses_the_rate_in_force_on_that_date(wiring, member):
    db, repo, config = wiring
    old_date = dt.date.today() - dt.timedelta(days=30)
    rows = []
    for effective, cost in ((old_date - dt.timedelta(days=1), '25.00'),
                            (dt.date.today(), '99.00')):
        rows.append(effective)
        _exec(db, f"""
            INSERT INTO {PREFIX}meal_settings (uuid, meal_type, cost, start_time, end_time,
                                               effective_from, created_at, updated_at, status)
            VALUES (%s, 'BREAKFAST', %s, NULL, NULL, %s, NOW(), NOW(), 1)
            ON DUPLICATE KEY UPDATE cost = VALUES(cost), start_time = NULL, end_time = NULL,
                                    status = 1
        """, (str(uuid.uuid4()), cost, effective))
    try:
        receipt = issue_token(db, repo, config, member, 'BREAKFAST', meal_date=old_date)
        # Priced at the rate effective on the meal date, not today's.
        assert decimal.Decimal(receipt['amount']) == decimal.Decimal('25.00')
    finally:
        for effective in rows:
            _exec(db, f"DELETE FROM {PREFIX}meal_settings WHERE meal_type = 'BREAKFAST' "
                      f"AND effective_from = %s", (effective,))


# --- rollback -----------------------------------------------------------------------------------

def test_dry_run_leaves_nothing_behind(wiring, member, open_meal):
    db, repo, config = wiring
    meal, _cost = open_meal
    before_due = due_of(db, member)
    before_seq = sequence_now(db)

    receipt = issue_token(db, repo, config, member, meal, dry_run=True)

    assert receipt['dry_run'] is True
    assert due_of(db, member) == before_due
    assert sequence_now(db) == before_seq
    assert _one(db, f"SELECT id FROM {PREFIX}meal_tokens WHERE token_number = %s",
                (receipt['token_number'],)) is None
