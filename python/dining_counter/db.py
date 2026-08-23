"""
MySQL access.

One long-lived connection, pinged before each unit of work. The counter runs for a whole meal
sitting on a machine where MySQL may be restarted underneath it, so a dead socket must recover on
its own rather than needing the operator to restart the app.
"""

import logging
import threading
from contextlib import contextmanager

import pymysql
from pymysql.cursors import DictCursor

log = logging.getLogger('dining-counter.db')


class Database:
    def __init__(self, settings):
        self._settings = dict(settings)
        self._conn = None
        self._lock = threading.RLock()

    def _connect(self):
        return pymysql.connect(
            host=self._settings['host'],
            port=self._settings['port'],
            user=self._settings['user'],
            password=self._settings['password'],
            database=self._settings['database'],
            charset='utf8mb4',
            cursorclass=DictCursor,
            autocommit=False,
            connect_timeout=5,
            read_timeout=15,
            write_timeout=15,
        )

    def connection(self):
        with self._lock:
            if self._conn is None:
                self._conn = self._connect()
            else:
                try:
                    # PyMySQL's own reconnect is deprecated, so the retry is explicit: a dead
                    # socket has to heal itself here, or a MySQL restart mid-sitting would need
                    # the operator to restart the counter.
                    self._conn.ping(reconnect=False)
                except Exception:
                    log.warning('connection lost; reconnecting', exc_info=True)
                    try:
                        self._conn.close()
                    except Exception:
                        pass
                    self._conn = self._connect()
            return self._conn

    @contextmanager
    def transaction(self, dry_run=False):
        """
        Commits on clean exit, rolls back on any exception.

        `dry_run` always rolls back -- it exercises every statement against live data without
        leaving anything behind, which is how the screen gets tested before a real sitting.
        """
        with self._lock:
            conn = self.connection()
            conn.begin()
            cursor = conn.cursor()
            try:
                yield cursor
            except Exception:
                conn.rollback()
                raise
            else:
                if dry_run:
                    conn.rollback()
                else:
                    conn.commit()
            finally:
                cursor.close()

    @contextmanager
    def read(self):
        """Read-only work. Still rolls back, so a stray REPEATABLE READ snapshot never lingers."""
        with self._lock:
            conn = self.connection()
            cursor = conn.cursor()
            try:
                yield cursor
            finally:
                cursor.close()
                try:
                    conn.rollback()
                except Exception:
                    pass

    def check(self):
        """Cheap liveness probe for the status dot."""
        with self.read() as cur:
            cur.execute('SELECT 1 AS ok')
            return cur.fetchone() is not None

    def close(self):
        with self._lock:
            if self._conn is not None:
                try:
                    self._conn.close()
                except Exception:
                    pass
                self._conn = None
