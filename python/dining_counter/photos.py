"""
Member photo resolution.

The photo is the operator's real check that the right person is at the counter, so it has to
appear fast and it has to appear at all. Four sources are tried in order, ending in a generated
initials tile -- the screen never shows an empty box.

Fetches happen off the UI thread and results are cached both in memory and on disk, so a repeat
scan is instant and a network blip never stalls the counter.
"""

import hashlib
import logging
import os
import threading

from .config import cache_dir

log = logging.getLogger('dining-counter.photos')

HTTP_TIMEOUT = 3.0
MEMORY_CACHE_LIMIT = 256


class PhotoResolver:
    def __init__(self, config):
        self.config = config
        self._memory = {}
        self._order = []
        self._lock = threading.Lock()
        self._disk = os.path.join(cache_dir(), 'photos')
        os.makedirs(self._disk, exist_ok=True)

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
        try:
            import requests
            response = requests.get(url, timeout=HTTP_TIMEOUT)
            if response.status_code == 200 and response.content:
                return response.content
        except Exception:
            log.info('photo fetch failed: %s', url, exc_info=True)
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
