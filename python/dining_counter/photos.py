"""
Member photo resolution.

The photo is the operator's real check that the right person is at the counter, so it has to
appear fast and it has to appear at all. Four sources are tried in order, ending in a generated
initials tile -- the screen never shows an empty box.

Fetches happen off the UI thread and results are cached both in memory and on disk, so a repeat
scan of the SAME member is instant and a network blip never stalls the counter for them again.

That per-member cache does not help the FIRST scan of every other member behind an unreachable
host, though, and on a fully local install (see docs/counter-pc-deployment.md) that is the common
case: the web admin is off by default now, so config.photo_http normally has nothing listening on
it at all, and a member's image_url points at an NCMS server this machine may have no route to.
Two dead hosts, each with its own HTTP_TIMEOUT, is 6 seconds of dead air in front of a queue for
every member with no local photo file -- once per host, per member, per run of the app, since a
miss is only cached after it happens.

The circuit breaker below is what turns that into "up to HTTP_TIMEOUT seconds once per host,
until it recovers" instead of "up to HTTP_TIMEOUT seconds per member". It trips a host after a
couple of consecutive failures and skips it outright for a cooldown, then allows one probe
through to test whether it has come back.
"""

import hashlib
import logging
import os
import threading
import time
from urllib.parse import urlparse

from .config import cache_dir

log = logging.getLogger('dining-counter.photos')

HTTP_TIMEOUT = 3.0
MEMORY_CACHE_LIMIT = 256

# Circuit breaker for _from_url. Two consecutive failures is enough to call a host down -- a
# single failure could be one bad request, but two in a row against a timeout this generous is
# not noise. 60s cooldown balances "recovers on its own reasonably soon" against "does not hammer
# a host that is going to stay down for the rest of the meal service".
BREAKER_FAILURE_THRESHOLD = 2
BREAKER_COOLDOWN_SECONDS = 60.0


class _HostBreaker:
    """Tracks consecutive HTTP failures per host (scheme+netloc) and short-circuits a dead one."""

    def __init__(self):
        self._lock = threading.Lock()
        self._failures = {}    # host -> consecutive failure count
        self._tripped_at = {}  # host -> time.monotonic() when it was tripped

    def allow(self, host):
        """False means: do not even try, the host is presumed down and still cooling down."""
        with self._lock:
            tripped_at = self._tripped_at.get(host)
            if tripped_at is None:
                return True
            if time.monotonic() - tripped_at >= BREAKER_COOLDOWN_SECONDS:
                # Half-open: let exactly one call through to test the water. It stays "tripped"
                # in bookkeeping terms until that call reports success or failure.
                return True
            return False

    def record_success(self, host):
        with self._lock:
            self._failures.pop(host, None)
            was_tripped = self._tripped_at.pop(host, None) is not None
        if was_tripped:
            log.info('photo host recovered: %s', host)

    def record_failure(self, host):
        with self._lock:
            count = self._failures.get(host, 0) + 1
            self._failures[host] = count
            newly_tripped = count >= BREAKER_FAILURE_THRESHOLD and host not in self._tripped_at
            if count >= BREAKER_FAILURE_THRESHOLD:
                self._tripped_at[host] = time.monotonic()
        if newly_tripped:
            log.warning(
                'photo host unreachable after %d attempts, skipping it for %ds: %s',
                count, int(BREAKER_COOLDOWN_SECONDS), host)


class PhotoResolver:
    def __init__(self, config):
        self.config = config
        self._memory = {}
        self._order = []
        self._lock = threading.Lock()
        self._disk = os.path.join(cache_dir(), 'photos')
        os.makedirs(self._disk, exist_ok=True)
        self._breaker = _HostBreaker()

    # --- cache ------------------------------------------------------------------------------

    def _remember(self, key, payload):
        with self._lock:
            if key not in self._memory:
                self._order.append(key)
                if len(self._order) > MEMORY_CACHE_LIMIT:
                    self._memory.pop(self._order.pop(0), None)
            self._memory[key] = payload

    def _recall(self, key):
        with self._lock:
            return self._memory.get(key)

    def _disk_path(self, key):
        return os.path.join(self._disk, hashlib.sha1(key.encode('utf-8')).hexdigest() + '.img')

    # --- sources ----------------------------------------------------------------------------

    def _from_folder(self, file_path):
        """
        `files.file_path` is stored relative to Laravel's storage/app/public, with forward
        slashes. The configured root is either a copy of that tree or a share pointing at it.
        """
        root = self.config.photo_root
        if not root or not file_path:
            return None
        full = os.path.join(root, str(file_path).replace('/', os.sep).lstrip(os.sep))
        try:
            if os.path.isfile(full):
                with open(full, 'rb') as handle:
                    return handle.read()
        except OSError:
            log.warning('could not read photo %s', full, exc_info=True)
        return None

    def _from_url(self, url):
        if not url:
            return None

        host = urlparse(url).netloc or url
        if not self._breaker.allow(host):
            return None

        try:
            import requests
            response = requests.get(url, timeout=HTTP_TIMEOUT)
            if response.status_code == 200 and response.content:
                self._breaker.record_success(host)
                return response.content
            # A host that answers but with an error status is not "down" in the sense this
            # breaker cares about -- it responded, just not with a photo.
            self._breaker.record_success(host)
        except Exception:
            log.info('photo fetch failed: %s', url, exc_info=True)
            self._breaker.record_failure(host)
        return None

    # --- entry point ------------------------------------------------------------------------

    def fetch(self, member):
        """
        Returns raw image bytes, or None when every source came up empty -- the UI draws its own
        initials tile in that case.

        `member` is the row from find_member_by_card: file_path, photo_id and image_url.
        """
        key = str(member.get('photo_id') or member.get('image_url') or member.get('id') or '')
        if not key:
            return None

        cached = self._recall(key)
        if cached is not None:
            return cached or None

        disk = self._disk_path(key)
        if os.path.isfile(disk):
            try:
                with open(disk, 'rb') as handle:
                    payload = handle.read()
                if payload:
                    self._remember(key, payload)
                    return payload
            except OSError:
                pass

        payload = self._from_folder(member.get('file_path'))

        if payload is None and member.get('photo_id') and self.config.photo_http:
            payload = self._from_url(self.config.photo_http.rstrip('/') + '/'
                                     + str(member['photo_id']))

        if payload is None:
            payload = self._from_url(member.get('image_url'))

        # Cache the miss too, as an empty value -- otherwise every scan of a member with no photo
        # re-attempts a network fetch that is never going to succeed.
        self._remember(key, payload or b'')
        if payload:
            try:
                with open(disk, 'wb') as handle:
                    handle.write(payload)
            except OSError:
                log.info('could not cache photo to %s', disk, exc_info=True)
        return payload


def initials(name):
    parts = [p for p in str(name or '').split() if p]
    if not parts:
        return '?'
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()
