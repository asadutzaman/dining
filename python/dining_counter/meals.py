"""
Current-meal detection.

Walks BREAKFAST, LUNCH, DINNER in order and returns the first one whose serving window contains
the current time. Windows are optional: a meal whose settings row leaves start_time or end_time
null is served with no time restriction at all, which is a supported configuration rather than a
misconfiguration.
"""

import datetime as dt
import logging

from .repository import MEAL_TYPES

log = logging.getLogger('dining-counter.meals')


class MealStatus:
    """
    windows_configured=False means *no* meal restricts by time -- the screen falls back to a
    manual picker. windows_configured=True with meal_type=None means we are between sittings and
    no token should be issued.
    """

    def __init__(self, meal_type=None, cost=None, windows_configured=False, windows=None):
        self.meal_type = meal_type
        self.cost = cost
        self.windows_configured = windows_configured
        self.windows = windows or {}

    def window_text(self, meal_type=None):
        meal_type = meal_type or self.meal_type
        window = self.windows.get(meal_type)
        if not window:
            return ''
        return '%s - %s' % (fmt_time(window[0]), fmt_time(window[1]))

    def __repr__(self):
        return '<MealStatus %s cost=%s windows=%s>' % (
            self.meal_type, self.cost, self.windows_configured)


def as_time(value):
    """meal_settings.start_time comes back as timedelta from MySQL TIME, or None."""
    if value is None:
        return None
    if isinstance(value, dt.timedelta):
        seconds = int(value.total_seconds()) % 86400
        return dt.time(seconds // 3600, (seconds % 3600) // 60, seconds % 60)
    if isinstance(value, dt.time):
        return value
    if isinstance(value, str):
        for pattern in ('%H:%M:%S', '%H:%M'):
            try:
                return dt.datetime.strptime(value, pattern).time()
            except ValueError:
                continue
    return None


def fmt_time(value):
    """Times are trimmed to HH:MM for operator-facing messages."""
    value = as_time(value)
    return value.strftime('%H:%M') if value else ''


def in_window(now, start, end):
    if start is None or end is None:
        return False
    if start <= end:
        return start <= now <= end
    # A window that wraps past midnight (e.g. 22:00-02:00).
    return now >= start or now <= end


def detect(db, repo, when=None):
    """Resolve the meal being served right now. Raises on DB failure; the caller decides."""
    when = when or dt.datetime.now()
    today = when.date()
    now = when.time()

    meal_type = None
    cost = None
    windows_configured = False
    windows = {}

    with db.read() as cur:
        for candidate in MEAL_TYPES:
            row = repo.effective_setting(cur, candidate, today)
            if not row:
                continue
            start = as_time(row['start_time'])
            end = as_time(row['end_time'])
            if start is None or end is None:
                continue
            windows_configured = True
            windows[candidate] = (start, end)
            if meal_type is None and in_window(now, start, end):
                meal_type = candidate
                cost = row['cost']

    return MealStatus(meal_type, cost, windows_configured, windows)
