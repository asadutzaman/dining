"""
Receipt printing.

Bytes go straight to the Windows spooler as RAW, exactly as the old print agent did -- no GDI, no
rasterization by the driver, nothing for Chrome's print pipeline to wedge.

What changed from the agent: the receipt is drawn into a bitmap and sent as an ESC/POS raster
image rather than as text. ESC/POS text mode is single-byte, so a Bengali member name came out as
a row of '?'.

The drawing is done by Qt rather than Pillow. Bengali needs complex text shaping -- reordered
vowel signs, conjunct ligatures -- and the Pillow wheels on this machine are built without Raqm,
so Pillow would place the glyphs in the wrong order: legible-looking nonsense, which is worse
than an obvious '?'. Qt bundles HarfBuzz and shapes correctly with no extra dependency. Painting
onto a QImage (rather than a QPixmap) is safe off the GUI thread, which is where printing runs.
"""

import logging
import os
import threading

import win32print
from PySide6.QtCore import QRect, Qt
from PySide6.QtGui import (QColor, QFont, QFontDatabase, QFontMetrics, QGuiApplication, QImage,
                           QPainter)

log = logging.getLogger('dining-counter.printing')

# 80mm at 203dpi is 576 dots across, which is 72 bytes per raster row.
PAPER_WIDTH = 576
BYTES_PER_ROW = PAPER_WIDTH // 8
MARGIN = 14
MAX_HEIGHT = 3000

# Some printers refuse a single GS v 0 taller than a few hundred rows. Banding is universally
# safe and costs nothing.
BAND_HEIGHT = 128

ESC = b'\x1b'
GS = b'\x1d'
INIT = ESC + b'@'
# Feed 3 lines clear of the head, then partial cut. Printers without a cutter ignore it.
FEED_AND_CUT = GS + b'V\x42\x03'

# Unambiguous, actionable conditions. Nothing will come out of the printer in these states, so
# refusing beats queueing a job that can only stack up unseen.
BLOCKING_FLAGS = [
    (win32print.PRINTER_STATUS_PAPER_OUT, 'out of paper'),
    (win32print.PRINTER_STATUS_PAPER_JAM, 'paper jam'),
    (win32print.PRINTER_STATUS_DOOR_OPEN, 'cover open'),
    (win32print.PRINTER_STATUS_OFFLINE, 'offline'),
    (win32print.PRINTER_STATUS_NOT_AVAILABLE, 'not available'),
    (win32print.PRINTER_STATUS_USER_INTERVENTION, 'needs attention'),
]

# Reported to the operator but never used to refuse a job. PRINTER_STATUS_ERROR is vague and the
# Rongta "80Normal" driver sets it even when the printer is perfectly usable. Refusing on it
# would turn "printing wedges occasionally" into "printing never works", which is the worse
# failure -- so warn, and still try.
ADVISORY_FLAGS = [
    (win32print.PRINTER_STATUS_ERROR, 'printer reports an error'),
]

# A queue this deep means jobs are not draining -- worth surfacing before it backs up unseen.
JOB_BACKLOG_WARN = 5

MEAL_LABEL = {'BREAKFAST': 'Breakfast', 'LUNCH': 'Lunch', 'DINNER': 'Dinner'}

# Nirmala UI ships with Windows and covers Bengali. Qt falls back per-glyph, so a Latin-only
# first choice still renders a Bengali name correctly.
FONT_FALLBACKS = ['Nirmala UI', 'Segoe UI', 'Arial']

_print_lock = threading.Lock()
_family_cache = {}


# --- printer ---------------------------------------------------------------------------------

def resolve_printer(configured):
    return configured or win32print.GetDefaultPrinter()


def printer_state(name):
    """
    {blocking, advisory, jobs}. `blocking` non-empty means do not print; `advisory` is worth
    telling the operator but is not grounds to refuse.
    """
    handle = win32print.OpenPrinter(name)
    try:
        info = win32print.GetPrinter(handle, 2)
    finally:
        win32print.ClosePrinter(handle)

    status = info.get('Status', 0)
    jobs = info.get('cJobs', 0) or 0
    advisory = [label for bit, label in ADVISORY_FLAGS if status & bit]
    if jobs >= JOB_BACKLOG_WARN:
        advisory.append('%d jobs waiting in the queue' % jobs)
    return {
        'blocking': ', '.join(label for bit, label in BLOCKING_FLAGS if status & bit),
        'advisory': ', '.join(advisory),
        'jobs': jobs,
    }


def write_raw(name, payload):
    """Send bytes to the printer untouched."""
    handle = win32print.OpenPrinter(name)
    try:
        win32print.StartDocPrinter(handle, 1, ('Meal Token', None, 'RAW'))
        try:
            win32print.StartPagePrinter(handle)
            win32print.WritePrinter(handle, payload)
            win32print.EndPagePrinter(handle)
        finally:
            win32print.EndDocPrinter(handle)
    finally:
        win32print.ClosePrinter(handle)


# --- fonts -----------------------------------------------------------------------------------

def ensure_qt():
    """
    Qt's text engine needs an application object. The counter always has one; --test-print and
    --preview do not, so make a headless one on demand.
    """
    app = QGuiApplication.instance()
    if app is None:
        os.environ.setdefault('QT_QPA_PLATFORM', 'offscreen')
        app = QGuiApplication([])
    return app


def resolve_family(configured):
    """
    `configured` may be a font *file* (as shipped in config.ini) or a family name. A file is
    registered with Qt and its real family name used; anything else is taken as a family.
    """
    if configured in _family_cache:
        return _family_cache[configured]

    family = ''
    if configured and os.path.isfile(configured):
        font_id = QFontDatabase.addApplicationFont(configured)
        families = QFontDatabase.applicationFontFamilies(font_id) if font_id != -1 else []
        if families:
            family = families[0]
        else:
            log.warning('font file %s could not be registered with Qt', configured)
    elif configured:
        family = configured

    if not family:
        available = set(QFontDatabase.families())
        family = next((f for f in FONT_FALLBACKS if f in available), FONT_FALLBACKS[-1])

    _family_cache[configured] = family
    return family


def has_shaping():
    """Qt bundles HarfBuzz, so complex scripts always shape correctly."""
    return True


# --- receipt ---------------------------------------------------------------------------------

class _Canvas:
    """A tall scratch image written top-down; cropped to the ink at the end."""

    def __init__(self, family):
        self.family = family
        self.image = QImage(PAPER_WIDTH, MAX_HEIGHT, QImage.Format_Grayscale8)
        self.image.fill(255)
        self.painter = QPainter(self.image)
        self.painter.setRenderHint(QPainter.TextAntialiasing, True)
        self.painter.setPen(QColor(0, 0, 0))
        self.y = MARGIN

    def font(self, size, bold=False):
        font = QFont(self.family)
        font.setPixelSize(size)
        font.setBold(bold)
        # Fall back per glyph rather than per string, so a Bengali name inside an otherwise Latin
        # receipt still renders.
        font.setStyleStrategy(QFont.PreferQuality)
        return font

    def _inner(self):
        return PAPER_WIDTH - MARGIN * 2

    def text(self, value, size, align='left', bold=False, gap=6):
        value = '' if value is None else str(value)
        font = self.font(size, bold)
        self.painter.setFont(font)
        height = QFontMetrics(font).height()
        flags = {'left': Qt.AlignLeft, 'center': Qt.AlignHCenter,
                 'right': Qt.AlignRight}[align] | Qt.AlignVCenter
        self.painter.drawText(QRect(MARGIN, self.y, self._inner(), height), flags, value)
        self.y += height + gap

    def row(self, label, value, size=26):
        """Label left, value right, sharing one line."""
        font = self.font(size)
        self.painter.setFont(font)
        height = QFontMetrics(font).height()
        box = QRect(MARGIN, self.y, self._inner(), height)
        self.painter.drawText(box, Qt.AlignLeft | Qt.AlignVCenter, str(label))
        self.painter.drawText(box, Qt.AlignRight | Qt.AlignVCenter,
                              '' if value is None else str(value))
        self.y += height + 8

    def rule(self, gap=12):
        self.y += 6
        self.painter.setPen(QColor(0, 0, 0))
        x = MARGIN
        while x < PAPER_WIDTH - MARGIN:
            self.painter.fillRect(QRect(x, self.y, 7, 2), QColor(0, 0, 0))
            x += 13
        self.y += gap

    def badge(self, value, size=30):
        font = self.font(size, bold=True)
        self.painter.setFont(font)
        metrics = QFontMetrics(font)
        width = metrics.horizontalAdvance(value) + 46
        height = metrics.height() + 18
        x0 = (PAPER_WIDTH - width) // 2
        box = QRect(x0, self.y, width, height)
        for i in range(3):   # a 3px frame, drawn as nested rectangles
            self.painter.drawRect(box.adjusted(i, i, -i, -i))
        self.painter.drawText(box, Qt.AlignCenter, value)
        self.y += height + 10

    def finish(self):
        self.painter.end()
        used = min(self.y + MARGIN, MAX_HEIGHT)
        return self.image.copy(0, 0, PAPER_WIDTH, used)


def render_receipt(data, font_path='', title='COLLEGE DINING'):
    """
    Mirrors the layout the browser and the old text agent produced, field for field: header,
    meal, token number (the largest thing on the paper -- it is what the food counter reads),
    the member rows, a DUE badge, and the issued timestamp.
    """
    ensure_qt()
    meal = MEAL_LABEL.get(data.get('meal_type'), data.get('meal_type') or '')

    canvas = _Canvas(resolve_family(font_path))
    canvas.text(data.get('title') or title, 34, align='center', bold=True)
    canvas.text('Meal Token', 26, align='center', gap=4)
    canvas.rule()

    canvas.text(meal, 48, align='center', bold=True, gap=0)
    canvas.text(data.get('token_number'), 92, align='center', bold=True)
    canvas.rule()

    canvas.row('Name', data.get('member_name'))
    canvas.row('Member', data.get('member_code'))
    canvas.row('Date', data.get('meal_date'))
    canvas.row('Amount', data.get('amount'))
    canvas.y += 8

    canvas.badge('DUE')
    canvas.rule()
    canvas.text('Issued: %s' % (data.get('created_at') or ''), 22, align='center', gap=4)
    canvas.text('Show this token to collect your meal', 22, align='center')
    return canvas.finish()


def image_to_escpos(image):
    """
    Pack a bitmap into GS v 0 raster commands.

    Qt's Format_Mono packs 1 bit per pixel MSB-first, but which index is black depends on the
    colour table, and ESC/POS wants 1 = fire the head. Both are resolved from the table rather
    than assumed. At 576 dots each row is exactly 72 bytes, so Qt's 4-byte scanline alignment
    happens to need no unpadding -- the slice below does not rely on that.
    """
    if image.width() != PAPER_WIDTH:
        image = image.scaledToWidth(PAPER_WIDTH, Qt.SmoothTransformation)
    mono = image.convertToFormat(QImage.Format_Mono, Qt.MonoOnly | Qt.ThresholdDither)

    table = mono.colorTable()
    # qGray of the colour at index 1; if index 1 is the light one, the bits are inverted for us.
    one_is_dark = True
    if len(table) >= 2:
        colour = QColor.fromRgb(table[1])
        one_is_dark = (colour.red() + colour.green() + colour.blue()) < 384

    stride = mono.bytesPerLine()
    raw = bytes(mono.constBits())
    height = mono.height()

    rows = []
    for y in range(height):
        line = raw[y * stride:y * stride + BYTES_PER_ROW]
        rows.append(line if one_is_dark else bytes(b ^ 0xFF for b in line))
    packed = b''.join(rows)

    out = bytearray()
    for top in range(0, height, BAND_HEIGHT):
        count = min(BAND_HEIGHT, height - top)
        chunk = packed[top * BYTES_PER_ROW:(top + count) * BYTES_PER_ROW]
        out += GS + b'v0' + bytes([
            0,
            BYTES_PER_ROW & 0xFF, (BYTES_PER_ROW >> 8) & 0xFF,
            count & 0xFF, (count >> 8) & 0xFF,
        ]) + chunk
    return bytes(out)


def build_payload(data, font_path='', title='COLLEGE DINING'):
    image = render_receipt(data, font_path=font_path, title=title)
    return INIT + image_to_escpos(image) + FEED_AND_CUT


# --- what the app talks to ---------------------------------------------------------------------

class ReceiptPrinter:
    def __init__(self, config):
        self.config = config

    def name(self):
        return resolve_printer(self.config.printer_name)

    def state(self):
        return printer_state(self.name())

    def print_token(self, data):
        """
        Returns {ok, printer, blocking, advisory, jobs, error}.

        A blocking printer is refused rather than queued: the token is already committed, and the
        operator needs to be told a slip is not coming rather than watch jobs stack up unseen.
        """
        if not self.config.printer_enabled:
            return {'ok': False, 'printer': '', 'blocking': 'printing disabled in config.ini',
                    'advisory': '', 'jobs': 0}
        try:
            name = self.name()
            state = self.state()
            if state['blocking']:
                log.warning('refused token %s: printer %s',
                            data.get('token_number'), state['blocking'])
                return dict(state, ok=False, printer=name)
            if state['advisory']:
                log.warning('printing token %s despite: %s',
                            data.get('token_number'), state['advisory'])
            payload = build_payload(data, font_path=self.config.font_path,
                                    title=self.config.title)
            # One job at a time; the printer is a single physical resource.
            with _print_lock:
                for _ in range(self.config.copies):
                    write_raw(name, payload)
            log.info('printed token %s', data.get('token_number'))
            return dict(state, ok=True, printer=name)
        except Exception as exc:
            log.exception('print failed for token %s', data.get('token_number'))
            return {'ok': False, 'printer': self.config.printer_name, 'blocking': '',
                    'advisory': '', 'jobs': 0, 'error': str(exc)}


def save_preview(data, path, font_path='', title='COLLEGE DINING'):
    """Write the rendered receipt to a PNG so the layout can be checked without burning paper."""
    render_receipt(data, font_path=font_path, title=title).save(path)
    return path
