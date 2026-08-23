# Meal Token Issue — Implementation Spec

> **How to use this document.** This is a build brief for reimplementing the dining
> meal-token issue flow on a different stack. It describes *behaviour, data, and contracts* —
> not the classes of the system it was extracted from. Everything load-bearing is marked as
> such; everything incidental says so. Section 6 lists defects in the original that you should
> **fix rather than port**. You should not need access to the original repository to build this.

---

## 1. Domain overview

A college dining hall runs a counter with an RFID card reader. At meal time a member punches
their card, the operator's screen resolves the card to a person, issues a **meal token** for the
meal currently being served, and prints an 80mm thermal receipt that the member hands over at the
food counter to collect their meal. The token is the record of the meal; collection is a separate
later step.

Members do not pay per meal. Each member carries a running **due balance** — issuing a token adds
the meal's cost to it, and separate payment records draw it down. Two further facts shape the
design. First, pricing is **effective-dated**: a meal type's cost is versioned by the date it took
effect, so a token issued for a past date must be priced at the rate in force on that date.
Second, the institution's staff/student roster (referred to here as the *candidate roster*, synced
from an external system) holds roughly 1000 people, but only 170–200 of them actually eat at the
dining hall, and nobody knows in advance which. Rather than pre-enrolling everyone, people become
dining members the first time they punch in at the counter.

That gives a card scan exactly three outcomes:

1. **The card belongs to an enrolled member.** Issue the token. This is the common case.
2. **The card is on the candidate roster but its owner is not a member yet.** Show who it is and
   ask the operator to confirm; on confirmation, enroll them and then issue the token.
3. **The card matches nothing.** Usually a member whose roster record has no RFID number
   recorded. The operator searches the roster by name, picks the person, and the physical card is
   bound to them — then the token is issued.

Outcome 2 must be an explicit operator click, never automatic. An accidental punch by any of the
~800 people who do not eat here would otherwise enroll them permanently.

---

## 2. Data model

Types below are given in portable terms. `bigint` columns are unsigned auto-increment primary
keys where marked PK. Every table carries a `uuid` (unique, generated on insert) alongside the
numeric id — this is the original system's convention for exposing records externally; keep it or
drop it as your stack prefers, it is **incidental**.

All tables also carry an audit footer: `created_by`, `updated_by` (nullable user ids),
`created_at`, `updated_at`, `deleted_at` (soft delete), and `status` (boolean, default 1 = active).
Exceptions are noted per table.

### 2.1 `meal_tokens` — the core record

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| `id` | bigint PK | no | — | |
| `uuid` | char(36) | no | — | unique |
| `token_number` | varchar | no | — | **unique**; human-facing, printed on the receipt |
| `member_id` | bigint | no | — | indexed; FK -> `members.id` **ON DELETE RESTRICT** |
| `meal_type` | varchar | no | — | indexed; `BREAKFAST` / `LUNCH` / `DINNER` |
| `meal_date` | date | no | — | indexed |
| `amount` | decimal(10,2) | no | — | the price snapshotted at issue time |
| `payment_status` | varchar | no | — | indexed; `PAID` / `DUE` |
| `payment_method` | varchar | **yes** | null | `CASH`; set only when `payment_status = PAID` |
| `collection_status` | varchar | no | `'ISSUED'` | indexed; `ISSUED` / `COLLECTED` |
| `collected_at` | timestamp | **yes** | null | |
| `collected_by` | bigint | **yes** | null | FK -> `users.id` **ON DELETE SET NULL** |
| `issued_by` | bigint | **yes** | null | FK -> `users.id` **ON DELETE SET NULL** |
| *audit footer* | | | | soft deletes enabled |

**Constraints — all three are load-bearing:**

- unique `uuid`
- unique `token_number`
- unique **composite `(member_id, meal_type, meal_date)`** — "one token per member per meal per
  day". This is the real duplicate guard; the application-level pre-check (§4 step 3) exists only
  to turn it into a readable error message.

Indexes: `member_id`, `meal_type`, `meal_date`, `payment_status`, `collection_status`.

**There is no token detail / line-items table.** One token is exactly one meal for one person.
Do not add one unless the requirement changes.

**No tenancy columns.** The original has no `organization_id` / `organogram_id` on this table, so
any multi-tenant row scoping in your framework will not apply here. If your target system is
multi-tenant, this is a gap you must close deliberately.

### 2.2 `meal_settings` — effective-dated pricing and serving windows

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| `id` | bigint PK | no | — | |
| `uuid` | char(36) | no | — | unique |
| `meal_type` | varchar | no | — | indexed; `BREAKFAST` / `LUNCH` / `DINNER` |
| `cost` | decimal(10,2) | no | — | |
| `start_time` | time | **yes** | null | serving window opens |
| `end_time` | time | **yes** | null | serving window closes |
| `cutoff_day_offset` | smallint | no | `0` | days before `meal_date` that pre-booking closes |
| `cutoff_time` | time | **yes** | null | time of day booking closes; null = no deadline |
| `effective_from` | date | no | — | indexed |
| *audit footer* | | | | soft deletes; `status` indexed |

Unique: `uuid`, and **`(meal_type, effective_from)`**.

**Effective-dated pricing.** A meal type has many rows, one per price change. The rate for a meal
on a given date is: *the row for that `meal_type` with the latest `effective_from` that is less
than or equal to the date, among rows with `status = 1`*. There is no `effective_to`; a row is
implicitly superseded by the next one. Always resolve the rate against `meal_date`, never against
"now" — that is what makes backdated issuance price correctly.

**Serving windows.** `start_time` / `end_time` are both nullable and are treated as a pair. When
both are set for the resolved rate row, a token for that meal may only be issued while the current
clock time falls inside the window. When either is absent, **there is no time restriction at all**
for that meal — this is a supported configuration, not a misconfiguration, and the client falls
back to a manual meal picker (§5).

**Cutoff fields** (`cutoff_day_offset`, `cutoff_time`) belong to the pre-booking feature, not to
issuance. They are listed here for completeness because they live on the same row. Reference
values from the original: breakfast `offset -1, 21:00` (previous evening); lunch `offset 0,
10:00`; dinner `offset 0, 15:00`.

### 2.3 `members`

Columns the issue flow depends on:

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| `id` | bigint PK | no | — | |
| `member_code` | varchar | no | — | **unique**; human-facing, printed on the receipt |
| `rfid_card_number` | varchar | **yes** | null | **unique**; the scan key. Nullable — a member can exist with no card yet |
| `member_type` | varchar | no | — | indexed; `STAFF` / `STUDENT` |
| `name` | varchar | no | — | |
| `due_balance` | decimal(10,2) | no | `0` | running balance owed |
| `status` | boolean | no | `1` | indexed; `0` blocks issuance |

Remaining columns, summarized — present on the record but not touched by issuance: `uuid`,
`phone` (indexed, deliberately **not** unique), `email`, `photo_id`; `department_id` and
`designation_id` (FK to their tables, `SET NULL`) for staff; `class_name`, `section`, `roll_no`
for students; `staff_id`; `candidate_id` (unique, FK to the roster table, `SET NULL`) linking back
to the roster record they were enrolled from; mobile-app fields (`language` default `'en'`, three
`notify_*` booleans, `last_login_at`); plus the audit footer with soft deletes.

> **`due_balance` is a denormalized running total, and the original system has no ledger.**
> It is mutated in place by increment/decrement, and nothing can re-derive it from the payment
> records. **Your rebuild should add an append-only ledger table** — one row per charge and per
> payment, with the balance either derived or reconciled against it. See §6.5.

### 2.4 `meal_bookings` — pre-booking, and why issuance cares

Members can pre-book meals from a mobile app. A booking that exists at issue time changes who owns
the charge (§4 step 9), so the rebuild must understand this table even if you implement booking
later.

| Column | Type | Null | Default |
|---|---|---|---|
| `id` | bigint PK | no | — |
| `uuid` | char(36) | no | — (unique) |
| `member_id` | bigint | no | — (FK -> `members.id`, **CASCADE**) |
| `meal_date` | date | no | — |
| `meal_type` | varchar | no | — |
| `unit_price` | decimal(10,2) | no | — |
| `cutoff_at` | datetime | **yes** | null |
| `booking_status` | varchar | no | `'BOOKED'` |
| `charge_status` | varchar | no | `'PENDING'` |
| `charged_amount` | decimal(10,2) | no | `0` |
| `source` | varchar | no | `'APP'` (`APP` / `COUNTER` / `ADMIN`) |
| `booked_at` | datetime | no | — |
| `cancelled_at` | datetime | **yes** | null |
| `settled_at` | datetime | **yes** | null |
| `meal_token_id` | bigint | **yes** | null (FK -> `meal_tokens.id`, **SET NULL**) |
| *audit footer* | | | **no soft deletes** |

- unique **`(member_id, meal_date, meal_type)`**
- index `(meal_date, meal_type, booking_status)` — kitchen counts
- index `(member_id, meal_date)` — the app's week grid
- index `(booking_status, charge_status)` — the nightly no-show settlement sweep

Two design points to preserve: **`unit_price` and `cutoff_at` are snapshotted at booking time**, so
later edits to `meal_settings` never rewrite what a member was quoted; and there are **deliberately
no soft deletes** — cancelling flips `booking_status` and re-booking reuses the row, which is what
makes the unique key work as a toggle.

### 2.5 `code_sequences` — human-facing number generation

One row per document type. Relevant row: `label = MEAL_TOKEN`, `prefix = 'TKN'`,
`separator = '-'`, `next_sequence` (integer, starts at 1) — producing `TKN-1`, `TKN-2`, and so on.

Columns: `id`, `uuid` (unique), `organogram_id` (nullable, indexed), `label`, `prefix`,
`separator`, `next_sequence`, audit footer, `sort_order` (default 0).

In the original, `label` is a database enum widened by successive `ALTER` statements
(`SUPPLIER, ITEM, REQUISITION, GRN, STOCK_TRANSFER, STOCK_ADJUSTMENT, MEMBER, MEAL_TOKEN,
PAYMENT`). That is **incidental** — a lookup table or a plain string is fine.

**See §6.1: the read-then-increment on this table is racy. Use an atomic sequence.**

### 2.6 Adjacent tables (summaries only)

- **`member_candidates`** — the roster synced from the external staff/student system. Holds name,
  identifiers, department/class info, and `rfid` where known. Members are enrolled *from*
  candidates; `members.candidate_id` points back. Needed for scan outcomes 2 and 3.
- **`payments`** — collections against `due_balance`. `payment_number` unique (`PAY-<n>`, from the
  same sequence mechanism), `member_id` (FK, RESTRICT), `amount`, `payment_date`, `payment_method`
  (default `CASH`), `remarks`, `collected_by` (FK to users, SET NULL). Not part of issuance.

### 2.7 Value sets

These are constrained in application code, not by the database, in the original. Your rebuild
should make them real enums or check constraints.

| Field | Values |
|---|---|
| `meal_type` | `BREAKFAST`, `LUNCH`, `DINNER` |
| `payment_status` | `PAID`, `DUE` |
| `payment_method` | `CASH` |
| `collection_status` | `ISSUED`, `COLLECTED` |
| `member_type` | `STAFF`, `STUDENT` |
| `booking_status` | `BOOKED`, `CANCELLED`, `CONSUMED`, `MISSED` |
| `charge_status` | `PENDING`, `CHARGED`, `WAIVED` |
| `source` (booking) | `APP`, `COUNTER`, `ADMIN` |

---

## 3. API contract

All paths are under `/api`. The counter screen depends on these endpoints.

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/meal-setting/current-meal` | — | `{meal_type, cost, windows_configured}` |
| GET | `/member/find-by-card` | `?rfid_card_number=` | member, or **404** |
| GET | `/member/candidate/find-by-card` | `?rfid_card_number=` | roster candidate, or **404** |
| GET | `/member/candidate` | list query (`$search`, `$top`, `$skip`) | candidate collection |
| POST | `/member/enroll-by-card` | `{rfid_card_number}` | member — **idempotent**: if the card already belongs to a member, return that member unchanged |
| POST | `/member/enroll-and-bind-card` | `{candidate_id, rfid_card_number}` | member, with the card bound |
| POST | `/meal-token` | see below | the issued token |
| PUT | `/meal-token/collect/{id}` | — | the updated token |
| DELETE | `/meal-token/{id}` | — | 204, charge reversed |
| GET | `/meal-token/find-by-token-number` | `?token_number=` | token, or **404** |

### 3.1 Issue request

```json
POST /api/meal-token
{
  "member_id": 42,
  "meal_type": "LUNCH",
  "meal_date": "2026-08-23",
  "payment_status": "DUE",
  "payment_method": null
}
```

Validation rules:

| Field | Rules |
|---|---|
| `member_id` | required, integer, must exist in `members` |
| `meal_type` | required, one of `BREAKFAST,LUNCH,DINNER` |
| `meal_date` | **optional**, a valid date — server defaults to today |
| `payment_status` | required, one of `PAID,DUE` |
| `payment_method` | **optional**, one of `CASH` — server defaults to `CASH` when `payment_status = PAID`, and forces `null` when `DUE` |

### 3.2 Issue response

The token, flattened with display fields joined in:

```json
{
  "id": 1234, "token_number": "TKN-871",
  "member_id": 42, "meal_type": "LUNCH", "meal_date": "2026-08-23",
  "amount": "65.00", "payment_status": "DUE", "payment_method": null,
  "collection_status": "ISSUED", "collected_at": null, "status": 1,
  "created_at": "2026-08-23 12:41:07",
  "member_code": "MEM-118", "member_name": "...", "member_type": "STAFF",
  "issued_by_name": "...", "collected_by_name": null
}
```

`member_*`, `issued_by_name` and `collected_by_name` are included only when the relation is
loaded. The receipt needs `token_number`, `meal_type`, `meal_date`, `amount`, `created_at`,
`member_name`, `member_code` — make sure the issue response carries all seven.

### 3.3 Response and error conventions

- **Collections** return `{ meta: { totalCount, pageCount, currentPage, perPage, ... }, results: [ ... ] }`.
- **Single resources** return the object directly, unwrapped.
- **Delete** returns `204`.
- **Errors** return HTTP **422** with a bare message string as the body. This matters: the client
  displays that string to the operator verbatim (see §5), so every rejection message in §4 is
  operator-facing copy, not a developer log line. Reserve `404` for "not found" lookups and `403`
  for authorization.

The list endpoints accept an OData-style query layer (`$select`, `$search`, `$filter`, `$orderby`,
`$apply`, `$skip`, `$top`); `$search` on tokens covers `token_number`. This is **incidental** —
use whatever list/filter convention your stack has.

---

## 4. The issue algorithm

This is the core of the feature. **The whole sequence runs inside one database transaction**;
any rejection rolls back. Each numbered step lists the message returned on failure (HTTP 422).

1. **Validate** the request body against §3.1. Resolve `mealDate = request.meal_date ?? today`.

2. **Load the member.** Reject if not found, or if `status != 1`:
   -> `"Member not found or inactive!"`

3. **Reject a duplicate.** Count existing tokens for `(member_id, meal_type, mealDate)`; if any
   exist:
   -> `"A token has already been issued to this member for this meal today!"`
   *(The composite unique index is the real guard; this check exists to produce a readable error.
   Note the soft-delete interaction in §6.2 — do not reproduce it.)*

4. **Resolve the rate.** Look up the effective `meal_settings` row for `(meal_type, mealDate)`
   per §2.2. If none:
   -> `"No active cost setting found for this meal type!"`

5. **Enforce the serving window.** If the resolved row has **both** `start_time` and `end_time`,
   compare the current clock time against them; outside the window:
   -> `"{Meal} can only be issued between {HH:MM} and {HH:MM}!"`
   (e.g. `"Lunch can only be issued between 12:30 and 14:30!"` — meal name title-cased, times
   trimmed to `HH:MM`.) If either bound is absent, **impose no restriction**.

6. **Reserve the token number** from the `MEAL_TOKEN` sequence (§2.5). If no sequence row exists:
   -> `"Number Sequence not found!"`

7. **Insert the token:**
   - `token_number` = the reserved number
   - `amount` = the resolved `meal_settings.cost`
   - `payment_method` = `request.payment_method ?? 'CASH'` when `payment_status = PAID`, else `null`
   - `collection_status` = `'ISSUED'`
   - `issued_by` = the authenticated user's id (nullable)

   If the insert yields nothing:
   -> `"Token issuance failed!"`

8. **Advance the sequence.**

9. **Post the charge — decide who owns it.** *This is the subtle part; get it wrong and members
   are billed twice for one meal.*

   Look for a booking on `(member_id, mealDate, meal_type)`.

   **If a booking exists with `booking_status = BOOKED`, the booking owns the charge**, not the
   token. Settle it: set `booking_status = CONSUMED`, `meal_token_id` = the new token's id,
   `charge_status = CHARGED`, `charged_amount = booking.unit_price`, `settled_at = now()`. Then,
   **only when `payment_status = DUE`**, increase the member's `due_balance` by
   `booking.unit_price`. When the member paid cash at the counter, the meal is consumed and the
   charge is recorded as already settled, but no due is posted.

   **Otherwise** — no booking, or the booking is not in `BOOKED` state — this is a walk-in. When
   `payment_status = DUE`, increase `due_balance` by the **meal-setting cost** from step 4.

   **Never run both paths.** Exactly one increment, or none for a `PAID` token.

   > Note the price asymmetry in the original: the token row stores the *meal-setting cost*, while
   > a booked meal posts the *booking's snapshotted `unit_price`*. These diverge if the rate
   > changed after the booking was made. See §6.3 — decide explicitly which price wins and use it
   > for both.

10. **Commit** and return the token (§3.2).

### 4.1 Collect

`PUT /meal-token/collect/{id}`. Load the token; 404 if missing. If `collection_status` is already
`COLLECTED`: -> `"This token has already been collected!"` Otherwise set
`collection_status = 'COLLECTED'`, `collected_at = now()`, `collected_by` = the authenticated
user. Transactional. Returns the reloaded token.

### 4.2 Void (delete) — the exact mirror of step 9

`DELETE /meal-token/{id}`. Load the token; 404 if missing. Then **undo whichever record posted the
charge**:

- Look for a booking on `(token.member_id, token.meal_date, token.meal_type)`. **If that booking's
  `meal_token_id` equals this token's id**, the booking owned the charge: if its `charge_status`
  is `CHARGED` and `charged_amount > 0`, decrease the member's `due_balance` by `charged_amount`;
  then return the booking to `booking_status = BOOKED`, `charge_status = PENDING`,
  `charged_amount = 0`, `meal_token_id = null`, `settled_at = null`.
- **Otherwise**, if the token's own `payment_status` is `DUE`, decrease `due_balance` by the
  token's `amount`.

Then delete the token and return `204`. Transactional.

### 4.3 Current-meal detection

`GET /meal-setting/current-meal` drives the counter screen. Given today's date and the current
time, walk `BREAKFAST, LUNCH, DINNER` in that order; for each, resolve its effective settings row
(§2.2) and skip if there is none. If a row has **both** `start_time` and `end_time`, set
`windows_configured = true`; and if the current time falls within that window and no meal has been
selected yet, take it as the current meal.

Return `{ meal_type, cost, windows_configured }`, where `meal_type` and `cost` are `null` when
nothing is being served.

- `windows_configured = false` means **no meal restricts by time at all** — the client falls back
  to a manual meal picker with no time restriction.
- `windows_configured = true` with `meal_type = null` means windows exist but we are between
  sittings, and no token should be issued.

---

## 5. Client behaviour

Rules the counter screen must preserve, each with the reason it exists.

**Issue payload.** The counter screen sends exactly `{member_id, meal_type, payment_status: 'DUE'}`.
It never sends `meal_date` or `payment_method` — the server defaults cover both. This screen only
ever issues DUE tokens; cash-at-counter is handled through the payments flow, not here.

**Block scanning until the current meal is known.** Keep a `mealLoaded` flag, false until the
first `current-meal` call settles (success *or* failure). While false, refuse the scan with a
"still loading, scan again in a moment" notice. This is load-bearing: without it, a card scanned
during that window issues a token for the client's default meal — a `BREAKFAST` token at dinner —
silently and irreversibly.

**Re-poll `current-meal` every 60 seconds**, so the screen rolls over from one sitting to the next
unattended. If the call fails, treat it as "no windows known" and fall back to the manual picker;
a failure is not fatal.

**Refuse a scan when no meal is active.** If windows are configured but `meal_type` is null:
"No meal is being served right now."

**Meal selection.** When `windows_configured` is true, the meal is auto-detected and shown
read-only. When false, show a three-option picker (`BREAKFAST` / `LUNCH` / `DINNER`). There is no
member dropdown — the member is always chosen by card scan.

**Three-way card resolution** (see §1). Scan -> `find-by-card`; on 404 -> `candidate/find-by-card`;
on 404 again -> unknown card. For the candidate case, render who they are and require an explicit
**confirm click** before enrolling — this is the guard against a stray punch permanently enrolling
one of the ~800 non-members. For the unknown case, open a roster search (minimum 2 characters, page
size 20) and bind the card to the selected person.

**Show the member even when issuance fails.** On error, still render who was scanned alongside the
error message. The operator needs to see *who* was refused — the common failure is "already issued
for this meal today", and the operator has to tell that specific person.

**Surface the server's message.** On a 422 with a string body, display that string verbatim; use a
generic network message for anything else. Every message in §4 is written for the operator.

**Clear the card field and refocus it after every outcome** — success, failure, or cancel. The
reader types into it like a keyboard; if focus is lost, the next scan goes nowhere.

### 5.1 Printing

Two paths, in preference order:

1. **Local ESC/POS agent.** A small service on the counter machine talks to the thermal printer
   directly. Send the seven receipt fields as JSON; it reports back `ok`, an optional `advisory`
   (warn but continue), or a blocking condition such as no paper or cover open — in which case
   tell the operator the token was **not printed** rather than failing silently. Probe for the
   agent on load so the screen can show which path is in use. **Prefer this path.**

2. **Browser printing (fallback).** Render an 80mm HTML receipt and print it. Queue jobs rather
   than printing inline — overlapping print jobs wedge Chrome's per-tab print pipeline — and keep
   printing off the scan critical path so the card field is ready for the next card immediately.

> The original's browser path reloads the tab after each print, carrying the last scan across the
> reload through a TTL'd session key, and skips the reload whenever the operator is mid-task
> (enrollment open, card partly typed, jobs still queued). **That is a workaround for Chrome's
> print pipeline wedging in kiosk mode.** Reimplement it only if you are also printing from a
> browser; a native or agent-driven printer path needs none of it.

**Receipt layout** (80mm, monospace, ~6mm top padding): centred header and "Meal Token" subtitle;
dashed rule; meal name large; **token number very large** — this is what the food counter reads;
dashed rule; then label/value rows for Name, Member code, Date, Amount; a boxed `DUE` badge;
dashed rule; issued-at timestamp and "Show this token to collect your meal".

---

## 6. Known defects — fix, do not port

The original ships all five. Each is described with its mechanism so you can close it deliberately.

**6.1 Token-number race.** The sequence is read and incremented as two separate unlocked
statements: read `next_sequence`, format the number, insert the token, then write back
`next_sequence + 1`. Two concurrent scans read the same value and mint the same `TKN-n`; only the
unique index stops the second one, and it does so as an integrity error (a 500), not as a handled
rejection. **Fix:** use a real atomic sequence — a database sequence, an atomic
increment-and-return, or a `SELECT ... FOR UPDATE` inside the existing transaction.

**6.2 Soft delete versus the unique key.** The duplicate pre-check (§4 step 3) queries through the
model's soft-delete scope and therefore ignores voided tokens, but the composite unique index on
`(member_id, meal_type, meal_date)` does **not** ignore them. So re-issuing after a void passes the
friendly check and then dies on the constraint. **Fix:** pick one — either make the uniqueness
partial (only over non-deleted rows) or make the pre-check include soft-deleted rows and reject
with a clear message.

**6.3 Booking price divergence.** The token stores `meal_settings.cost` while a booked meal posts
`booking.unit_price` to the balance (§4 step 9). If the rate changed between booking and
consumption, the token says one number and the member is billed another — and the printed receipt
shows the wrong one. **Fix:** decide which price is authoritative (the booking snapshot is the
defensible choice — it is what the member was quoted) and use that single value for both the
token's `amount` and the balance posting.

**6.4 No backend authorization.** The original's auth middleware only proves that a session token
exists. A permission scheme is defined and seeded — scopes named
`auth:mealToken:{menuAccess|list|view|create|collect|delete}` — but it is enforced **only** by the
frontend menu deciding what to render. Any authenticated user can `POST /api/meal-token` directly.
**Fix:** enforce the scopes server-side on every route. Suggested mapping:

| Route | Scope |
|---|---|
| `GET /meal-token` | `list` |
| `GET /meal-token/{id}` | `view` |
| `POST /meal-token` | `create` |
| `PUT /meal-token/collect/{id}` | `collect` |
| `DELETE /meal-token/{id}` | `delete` |

Also note that `find-by-token-number` and the enrollment endpoints carry no scope at all in the
original — assign them one.

**6.5 No ledger.** `due_balance` is mutated in place by increment/decrement, and the `payments`
table records collections without anything re-deriving the balance from them. A single missed
rollback silently corrupts a member's balance with no audit trail and no way to reconstruct it.
**Fix:** add an append-only ledger — one row per charge (token issued), reversal (token voided),
and payment, each referencing its source record — and either derive the balance from it or
reconcile against it on a schedule.

**One more thing to decide, not a defect:** the original has no `PUT` / `PATCH` route for tokens —
a token can be issued, collected, or voided, but never edited. That is a reasonable stance for a
financial record. Keep it unless you have a reason not to.

---

## 7. Acceptance checklist

Each of these should be a test.

**Happy paths**

- [ ] Walk-in `DUE` issue creates the token and increases `due_balance` by the meal cost — **exactly once**.
- [ ] Issue for a member with a `BOOKED` booking settles that booking (`CONSUMED`, `CHARGED`, token linked, `settled_at` set) and increases `due_balance` by the booking's `unit_price` — **exactly once**, not twice.
- [ ] Issue with `payment_status = PAID` and a `BOOKED` booking settles the booking but posts **no** due.
- [ ] `payment_method` is stored only for `PAID` tokens and is `null` for `DUE`.
- [ ] Collect flips `collection_status` and stamps `collected_at` and `collected_by`.

**Rejections** (each returns 422 with the operator-facing message and leaves no partial state)

- [ ] Second scan for the same member/meal/day is rejected.
- [ ] Scan outside a configured serving window is rejected, naming the window.
- [ ] Scan when the meal has **no** window configured succeeds — no time restriction.
- [ ] Meal type with no effective rate row is rejected.
- [ ] Inactive member (`status = 0`) is rejected.
- [ ] Non-existent member is rejected by validation.
- [ ] Collecting an already-collected token is rejected.

**Reversal**

- [ ] Voiding a walk-in `DUE` token decreases `due_balance` by the token's amount.
- [ ] Voiding a booked-meal token decreases `due_balance` by the booking's `charged_amount` and returns the booking to `BOOKED` / `PENDING` with `meal_token_id` cleared.
- [ ] Voiding a `PAID` walk-in token changes no balance.
- [ ] In no case does a void reverse both paths.

**Correctness under stress**

- [ ] Two concurrent scans for different members never produce a duplicate `token_number` (§6.1).
- [ ] Re-issuing after a void succeeds, or fails with a readable message — never an integrity error (§6.2).
- [ ] A failure at any step of §4 leaves `due_balance`, the booking, and the sequence unchanged.

**Pricing**

- [ ] A token issued for a past `meal_date` is priced at the rate effective on that date, not today's.
- [ ] Token `amount` and the amount posted to the balance always agree (§6.3).

**Authorization**

- [ ] Every token route rejects a caller lacking the corresponding scope (§6.4).
