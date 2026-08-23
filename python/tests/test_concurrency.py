"""
Concurrency.

The original minted token numbers with an unlocked read-then-write, so two scans a moment apart
produced the same TKN-n and the second died as a 500-level integrity error. Each worker here gets
its own connection, exactly as two counters against one database would.
"""

import datetime as dt
import os
import sys
import threading
import uuid

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dining_counter import config as config_module          # noqa: E402
from dining_counter.db import Database                      # noqa: E402
from dining_counter.issue import issue_token                # noqa: E402
from dining_counter.repository import Repository            # noqa: E402

from test_issue import PREFIX, TEST_DB, FakeConfig, _exec, sequence_now   # noqa: E402

WORKERS = 8


@pytest.fixture
def settings():
    base = config_module.load()
    values = dict(base.db)
    values['database'] = TEST_DB
    probe = Database(values)
    try:
        probe.check()
    except Exception as exc:                                    # pragma: no cover
        pytest.skip('test database %s unavailable: %s' % (TEST_DB, exc))
    probe.close()
    return values


@pytest.fixture
def crowd(settings):
    """One member per worker: the duplicate guard is per member, the sequence is shared."""
    db = Database(settings)
    ids = []
    for _ in range(WORKERS):
        tag = uuid.uuid4().hex[:8]
        ids.append(_exec(db, f"""
            INSERT INTO {PREFIX}members (uuid, member_code, rfid_card_number, member_type, name,
                                         due_balance, created_at, updated_at, status)
            VALUES (%s, %s, %s, 'STAFF', %s, 0.00, NOW(), NOW(), 1)
        """, (str(uuid.uuid4()), 'RACE-%s' % tag, 'RC-%s' % tag, 'Race %s' % tag)))
    effective = dt.date.today()
    _exec(db, f"""
        INSERT INTO {PREFIX}meal_settings (uuid, meal_type, cost, start_time, end_time,
                                           effective_from, created_at, updated_at, status)
        VALUES (%s, 'LUNCH', 60.00, '00:00:00', '23:59:59', %s, NOW(), NOW(), 1)
        ON DUPLICATE KEY UPDATE start_time = '00:00:00', end_time = '23:59:59', status = 1
    """, (str(uuid.uuid4()), effective))
    yield db, ids
    for member_id in ids:
        _exec(db, f"DELETE FROM {PREFIX}meal_tokens WHERE member_id = %s", (member_id,))
        _exec(db, f"DELETE FROM {PREFIX}members WHERE id = %s", (member_id,))
    _exec(db, f"DELETE FROM {PREFIX}meal_settings WHERE meal_type = 'LUNCH' "
              f"AND effective_from = %s", (effective,))
    db.close()


def test_simultaneous_scans_never_share_a_token_number(settings, crowd):
    db, ids = crowd
    repo = Repository(PREFIX)
    config = FakeConfig()
    before = sequence_now(db)

    numbers = []
    errors = []
    lock = threading.Lock()
    gate = threading.Barrier(len(ids))

    def punch(member_id):
        own = Database(settings)          # a separate connection, like a second counter
        try:
            gate.wait(timeout=10)
            receipt = issue_token(own, repo, config, member_id, 'LUNCH')
            with lock:
                numbers.append(receipt['token_number'])
        except Exception as exc:          # pragma: no cover
            with lock:
                errors.append(exc)
        finally:
            own.close()

    threads = [threading.Thread(target=punch, args=(member_id,)) for member_id in ids]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=30)

    assert not errors, 'concurrent issue raised: %r' % errors
    assert len(numbers) == len(ids)
    assert len(set(numbers)) == len(numbers), 'duplicate token numbers: %s' % sorted(numbers)
    # The sequence advanced exactly once per token -- no gaps, no reuse.
    assert sequence_now(db) == before + len(ids)
    assert sorted(numbers) == sorted('TKN-%d' % n for n in range(before, before + len(ids)))
