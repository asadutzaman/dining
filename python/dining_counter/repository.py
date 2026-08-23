"""
Every SQL statement the app runs.

All table names carry the configured prefix (`auth_aq4nl4ag_` in this deployment), so nothing
here hardcodes a table name.

Written against the *live* schema, which lags the Laravel migrations: `meal_settings` has no
cutoff columns and `members` has none of the mobile-app columns. Selecting them would fail.
"""

import uuid as uuidlib

MEAL_TYPES = ('BREAKFAST', 'LUNCH', 'DINNER')
MEAL_LABEL = {'BREAKFAST': 'Breakfast', 'LUNCH': 'Lunch', 'DINNER': 'Dinner'}


class Repository:
    def __init__(self, prefix):
        self.p = prefix

    # --- members ------------------------------------------------------------------------------

    def find_member_by_card(self, cur, card):
        """
        The hot path -- one round trip for everything the screen shows.

        `members.photo_id` is a varchar holding `files.file_id`, not an integer FK, so the join is
        on the string. The candidate join supplies `image_url` as a photo fallback.
        """
        cur.execute(
            f"""
            SELECT m.id, m.member_code, m.name, m.member_type, m.status, m.due_balance,
                   m.photo_id, m.candidate_id, m.staff_id, m.class_name, m.section, m.roll_no,
                   f.file_path, c.image_url
              FROM {self.p}members m
              LEFT JOIN {self.p}files f
                     ON f.file_id = m.photo_id AND f.deleted_at IS NULL
              LEFT JOIN {self.p}member_candidates c
                     ON c.id = m.candidate_id
             WHERE m.rfid_card_number = %s AND m.deleted_at IS NULL
             LIMIT 1
            """,
            (card,),
        )
        return cur.fetchone()

    def lock_member(self, cur, member_id):
        cur.execute(
            f"""
            SELECT id, member_code, name, member_type, status, due_balance
              FROM {self.p}members
             WHERE id = %s AND deleted_at IS NULL
             FOR UPDATE
            """,
            (member_id,),
        )
        return cur.fetchone()

    def add_due(self, cur, member_id, amount):
        cur.execute(
            f"""
            UPDATE {self.p}members
               SET due_balance = due_balance + %s, updated_at = NOW()
             WHERE id = %s
            """,
            (amount, member_id),
        )

    # --- meal settings ------------------------------------------------------------------------

    def effective_setting(self, cur, meal_type, meal_date):
        """
        Effective-dated pricing: the latest active row whose `effective_from` is on or before the
        meal date. Resolved against `meal_date`, never against today -- that is what prices a
        backdated token correctly.
        """
        cur.execute(
            f"""
            SELECT id, meal_type, cost, start_time, end_time, effective_from
              FROM {self.p}meal_settings
             WHERE meal_type = %s
               AND status = 1
               AND deleted_at IS NULL
               AND effective_from <= %s
             ORDER BY effective_from DESC
             LIMIT 1
            """,
            (meal_type, meal_date),
        )
        return cur.fetchone()

    # --- tokens -------------------------------------------------------------------------------

    def existing_token(self, cur, member_id, meal_type, meal_date):
        """
        Deliberately does NOT filter out soft-deleted rows.

        The composite unique key on (member_id, meal_type, meal_date) does not exclude them
        either, so a voided token still blocks re-issue at the database level. Seeing it here is
        what turns an integrity error into a message the operator can act on.
        """
        cur.execute(
            f"""
            SELECT id, token_number, deleted_at
              FROM {self.p}meal_tokens
             WHERE member_id = %s AND meal_type = %s AND meal_date = %s
             LIMIT 1
            """,
            (member_id, meal_type, meal_date),
        )
        return cur.fetchone()

    def insert_token(self, cur, *, token_number, member_id, meal_type, meal_date, amount,
                     payment_status='DUE', payment_method=None, issued_by=None, created_by=None):
        """None of uuid / created_at / updated_at has a DB default -- all three are set here."""
        cur.execute(
            f"""
            INSERT INTO {self.p}meal_tokens
                (uuid, token_number, member_id, meal_type, meal_date, amount,
                 payment_status, payment_method, collection_status,
                 issued_by, created_by, created_at, updated_at, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'ISSUED', %s, %s, NOW(), NOW(), 1)
            """,
            (str(uuidlib.uuid4()), token_number, member_id, meal_type, meal_date, amount,
             payment_status, payment_method, issued_by, created_by),
        )
        return cur.lastrowid

    def load_token(self, cur, token_id):
        cur.execute(
            f"""
            SELECT id, token_number, member_id, meal_type, meal_date, amount,
                   payment_status, collection_status, created_at
              FROM {self.p}meal_tokens
             WHERE id = %s
            """,
            (token_id,),
        )
        return cur.fetchone()

    # --- code sequences -----------------------------------------------------------------------

    def lock_sequence(self, cur, label='MEAL_TOKEN'):
        """
        FOR UPDATE serialises the mint. Held until COMMIT, so two simultaneous punches cannot
        read the same `next_sequence` and produce the same TKN-n.

        `separator` is a MySQL keyword and has to be backticked.
        """
        cur.execute(
            f"""
            SELECT id, prefix, `separator`, next_sequence
              FROM {self.p}code_sequences
             WHERE label = %s AND status = 1 AND deleted_at IS NULL
             ORDER BY id
             LIMIT 1
             FOR UPDATE
            """,
            (label,),
        )
        return cur.fetchone()

    def advance_sequence(self, cur, sequence_id):
        cur.execute(
            f"""
            UPDATE {self.p}code_sequences
               SET next_sequence = next_sequence + 1, updated_at = NOW()
             WHERE id = %s
            """,
            (sequence_id,),
        )

    # --- bookings -----------------------------------------------------------------------------

    def lock_booking(self, cur, member_id, meal_date, meal_type):
        cur.execute(
            f"""
            SELECT id, unit_price, booking_status, charge_status, charged_amount, meal_token_id
              FROM {self.p}meal_bookings
             WHERE member_id = %s AND meal_date = %s AND meal_type = %s
             LIMIT 1
             FOR UPDATE
            """,
            (member_id, meal_date, meal_type),
        )
        return cur.fetchone()

    def settle_booking(self, cur, booking_id, token_id, amount):
        cur.execute(
            f"""
            UPDATE {self.p}meal_bookings
               SET booking_status = 'CONSUMED',
                   charge_status  = 'CHARGED',
                   charged_amount = %s,
                   meal_token_id  = %s,
                   settled_at     = NOW(),
                   updated_at     = NOW()
             WHERE id = %s
            """,
            (amount, token_id, booking_id),
        )
