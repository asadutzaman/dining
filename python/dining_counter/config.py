"""
Configuration for the counter app.

`config.ini` lives *beside the exe*, not inside it, so the kiosk's DB host, printer name and
photo folder can be changed without a rebuild. Every key has a working default, so a missing
config.ini still starts.
"""

import configparser
import os
import sys

APP_NAME = 'DiningCounter'

DEFAULTS = {
    'database': {
        'host': '127.0.0.1',
        'port': '3306',
        'database': 'dining',
        'user': 'root',
        'password': '',
        'prefix': 'auth_aq4nl4ag_',
    },
    'printer': {
        'enabled': 'true',
        'name': '',          # blank -> Windows default printer
        'copies': '1',
    },
    'photos': {
        'root': '',
        'http_fallback': 'http://127.0.0.1:8000/api/file/view/',
        'font': r'C:\Windows\Fonts\Nirmala.ttc',
    },
    'app': {
        'title': 'COLLEGE DINING',
        'issued_by': '',     # blank -> NULL; this app has no login
        'fullscreen': 'true',
        'result_seconds': '8',
        'meal_poll_seconds': '60',
    },
}


def app_dir():
    """Directory of the exe when frozen by PyInstaller, else of the project root."""
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def cache_dir():
    base = os.environ.get('LOCALAPPDATA') or os.path.expanduser('~')
    path = os.path.join(base, APP_NAME)
    os.makedirs(path, exist_ok=True)
    return path


class Config:
    def __init__(self, parser, path):
        self._parser = parser
        self.path = path

    def _get(self, section, key):
        try:
            return self._parser.get(section, key)
        except (configparser.NoSectionError, configparser.NoOptionError):
            return DEFAULTS[section][key]

    def get(self, section, key, default=None):
        value = self._get(section, key)
        value = value.strip() if isinstance(value, str) else value
        return value if value else (default if default is not None else value)

    def getint(self, section, key):
        raw = str(self._get(section, key)).strip()
        try:
            return int(raw)
        except ValueError:
            return int(DEFAULTS[section][key])

    def getbool(self, section, key):
        raw = str(self._get(section, key)).strip().lower()
        return raw in ('1', 'true', 'yes', 'on')

    def get_optional_int(self, section, key):
        """Blank means 'unset' -> None, which becomes SQL NULL."""
        raw = str(self._get(section, key)).strip()
        if not raw:
            return None
        try:
            return int(raw)
        except ValueError:
            return None

    # --- grouped accessors the rest of the app uses ------------------------------------------

    @property
    def db(self):
        return {
            'host': self.get('database', 'host'),
            'port': self.getint('database', 'port'),
            'database': self.get('database', 'database'),
            'user': self.get('database', 'user'),
            # Password may legitimately be empty -- do not run it through get()'s falsy fallback.
            'password': self._get('database', 'password').strip(),
        }

    @property
    def prefix(self):
        return self._get('database', 'prefix').strip()

    @property
    def printer_enabled(self):
        return self.getbool('printer', 'enabled')

    @property
    def printer_name(self):
        return self._get('printer', 'name').strip()

    @property
    def copies(self):
        return max(1, self.getint('printer', 'copies'))

    @property
    def photo_root(self):
        return self._get('photos', 'root').strip()

    @property
    def photo_http(self):
        return self._get('photos', 'http_fallback').strip()

    @property
    def font_path(self):
        return self._get('photos', 'font').strip()

    @property
    def title(self):
        return self._get('app', 'title').strip() or 'COLLEGE DINING'

    @property
    def issued_by(self):
        return self.get_optional_int('app', 'issued_by')

    @property
    def fullscreen(self):
        return self.getbool('app', 'fullscreen')

    @property
    def result_seconds(self):
        return max(2, self.getint('app', 'result_seconds'))

    @property
    def meal_poll_seconds(self):
        return max(10, self.getint('app', 'meal_poll_seconds'))


def load(path=None):
    parser = configparser.ConfigParser()
    parser.read_dict(DEFAULTS)
    path = path or os.path.join(app_dir(), 'config.ini')
    if os.path.exists(path):
        # inline_comment_prefixes is off by default, so ';' after a value would be read as part
        # of it. The example file uses ';' comments, so honour them.
        parser = configparser.ConfigParser(inline_comment_prefixes=(';',))
        parser.read_dict(DEFAULTS)
        parser.read(path, encoding='utf-8')
    return Config(parser, path)
