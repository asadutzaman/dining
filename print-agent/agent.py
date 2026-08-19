"""
Dining kiosk print agent.

Prints meal-token receipts by sending ESC/POS bytes straight to the thermal printer, instead of
going through the browser. Chrome's print pipeline rasterizes an 80mm receipt into a full-page
image and pushes it through the Windows GDI spooler; that path wedges after a handful of jobs
under kiosk use. ESC/POS is ~500 bytes of text per receipt and has no such state to wedge.

Runs on the kiosk PC, listens on 127.0.0.1 only, and is driven by the meal-token issue page.

  GET  /health  -> {"ok": true, "printer": "...", "status": "..."}
  POST /print   -> token JSON in, receipt out

Windows only: depends on pywin32 for raw printer access.
"""

import configparser
import json
import logging
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from logging.handlers import RotatingFileHandler

import win32print

DEFAULT_HOST = '127.0.0.1'
DEFAULT_PORT = 9101

# 80mm paper at Font A is 48 columns. Receipt rows are padded to this for left/right alignment.
LINE_WIDTH = 48

# --- ESC/POS ---------------------------------------------------------------------------------
ESC = b'\x1b'
GS = b'\x1d'

INIT = ESC + b'@'
ALIGN_LEFT = ESC + b'a\x00'
ALIGN_CENTER = ESC + b'a\x01'
BOLD_ON = ESC + b'E\x01'
BOLD_OFF = ESC + b'E\x00'
SIZE_NORMAL = GS + b'!\x00'
SIZE_DOUBLE_H = GS + b'!\x01'   # double height
SIZE_DOUBLE_HW = GS + b'!\x11'  # double height + width
# Feed 3 lines clear of the head, then partial cut. GS V 66 n is the widely supported form;
# printers without a cutter simply ignore it.
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

# Reported to the operator but never used to refuse a job. PRINTER_STATUS_ERROR is vague and
# this Rongta driver ("80Normal" on RongtaUSB PORT:) sets it even when the printer is usable.
# Refusing on it would turn "printing wedges occasionally" into "printing never works", which is
# the worse failure -- so warn, and still try.
ADVISORY_FLAGS = [
    (win32print.PRINTER_STATUS_ERROR, 'printer reports an error'),
]

# A queue this deep means jobs are not draining -- worth surfacing before it silently backs up.
JOB_BACKLOG_WARN = 5

MEAL_LABEL = {'BREAKFAST': 'Breakfast', 'LUNCH': 'Lunch', 'DINNER': 'Dinner'}

print_lock = threading.Lock()
log = logging.getLogger('print-agent')


def app_dir():
    """Directory of the exe when frozen by PyInstaller, else of this source file."""
    if getattr(sys, 'frozen', False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


def load_config():
    """Optional agent.ini beside the exe. Every key has a working default."""
    cfg = {
        'printer': '',  # blank -> Windows default printer
        'port': DEFAULT_PORT,
    }
    path = os.path.join(app_dir(), 'agent.ini')
    if not os.path.exists(path):
        return cfg
    parser = configparser.ConfigParser()
    try:
        parser.read(path, encoding='utf-8')
        if parser.has_section('agent'):
            section = parser['agent']
            cfg['printer'] = section.get('printer', cfg['printer']).strip()
            cfg['port'] = section.getint('port', cfg['port'])
    except Exception:
        log.exception('agent.ini could not be read; using defaults')
    return cfg


def setup_logging():
    handler = RotatingFileHandler(
        os.path.join(app_dir(), 'print-agent.log'), maxBytes=512000, backupCount=3, encoding='utf-8'
    )
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
    log.addHandler(handler)
    log.setLevel(logging.INFO)


# --- Printer ---------------------------------------------------------------------------------

def resolve_printer(configured):
    return configured or win32print.GetDefaultPrinter()


def printer_state(name):
    """
    {blocking, advisory, jobs} for the printer. `blocking` non-empty means do not print;
    `advisory` is worth telling the operator but is not grounds to refuse.
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
    """Send bytes to the printer untouched -- no GDI, no rasterization."""
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


# --- Receipt ---------------------------------------------------------------------------------

def encode(text):
    """
    ESC/POS text mode is single-byte. Anything outside the printer's code page becomes '?'
    rather than crashing the job -- a receipt with a mangled name still beats no receipt.
    """
    return str(text if text is not None else '').encode('cp437', errors='replace')


def row(label, value):
    """Label left, value right, padded to the paper width."""
    label, value = str(label), str(value if value is not None else '')
    gap = LINE_WIDTH - len(label) - len(value)
    if gap < 1:
        value = value[: max(0, LINE_WIDTH - len(label) - 1)]
        gap = 1
    return encode(label + (' ' * gap) + value) + b'\n'


def build_receipt(data):
    """Mirrors the HTML receipt the browser used to print, field for field."""
    meal = MEAL_LABEL.get(data.get('meal_type'), data.get('meal_type') or '')
    rule = encode('-' * LINE_WIDTH) + b'\n'

    out = bytearray()
    out += INIT
    out += ALIGN_CENTER

    out += BOLD_ON + encode(data.get('title') or 'COLLEGE DINING') + b'\n' + BOLD_OFF
    out += encode('Meal Token') + b'\n'
    out += rule

    out += SIZE_DOUBLE_H + BOLD_ON + encode(meal) + b'\n' + BOLD_OFF + SIZE_NORMAL
    out += SIZE_DOUBLE_HW + BOLD_ON + encode(data.get('token_number')) + b'\n' + BOLD_OFF
    out += SIZE_NORMAL
    out += rule

    out += ALIGN_LEFT
    out += row('Name', data.get('member_name'))
    out += row('Member', data.get('member_code'))
    out += row('Date', data.get('meal_date'))
    out += row('Amount', data.get('amount'))

    out += ALIGN_CENTER
    out += BOLD_ON + encode('[ DUE ]') + b'\n' + BOLD_OFF
    out += rule
    out += encode('Issued: %s' % (data.get('created_at') or '')) + b'\n'
    out += encode('Show this token to collect your meal') + b'\n'

    out += FEED_AND_CUT
    return bytes(out)


# --- HTTP ------------------------------------------------------------------------------------

class Handler(BaseHTTPRequestHandler):
    config = {}

    def log_message(self, fmt, *args):
        log.info('%s - %s', self.address_string(), fmt % args)

    def _respond(self, code, body):
        payload = json.dumps(body).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(payload)))
        # Always open. The agent only ever listens on 127.0.0.1 -- that binding is the real
        # security boundary, not the Origin header -- so locking this down would only risk
        # silently breaking printing if the dining app's hosting address ever changes, for no
        # real protection in return.
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_GET(self):
        if self.path.rstrip('/') != '/health':
            self._respond(404, {'ok': False, 'error': 'not found'})
            return
        try:
            name = resolve_printer(self.config.get('printer'))
            state = printer_state(name)
            self._respond(200, dict(state, ok=True, printer=name))
        except Exception as exc:
            log.exception('health check failed')
            self._respond(500, {'ok': False, 'error': str(exc)})

    def do_POST(self):
        if self.path.rstrip('/') != '/print':
            self._respond(404, {'ok': False, 'error': 'not found'})
            return
        try:
            length = int(self.headers.get('Content-Length') or 0)
            data = json.loads(self.rfile.read(length) or b'{}')
        except Exception as exc:
            self._respond(400, {'ok': False, 'error': 'bad request: %s' % exc})
            return

        try:
            name = resolve_printer(self.config.get('printer'))
            state = printer_state(name)
            if state['blocking']:
                # Refuse rather than queue into a printer that demonstrably cannot print. The page
                # shows this to the operator, who would otherwise hand out nothing.
                log.warning(
                    'refused token %s: printer %s', data.get('token_number'), state['blocking']
                )
                self._respond(200, dict(state, ok=False, printer=name))
                return
            if state['advisory']:
                log.warning(
                    'printing token %s despite: %s', data.get('token_number'), state['advisory']
                )
            # One job at a time; the printer is a single physical resource.
            with print_lock:
                write_raw(name, build_receipt(data))
            log.info('printed token %s', data.get('token_number'))
            self._respond(200, dict(state, ok=True, printer=name))
        except Exception as exc:
            log.exception('print failed for token %s', data.get('token_number'))
            self._respond(500, {'ok': False, 'error': str(exc)})


def main():
    setup_logging()
    config = load_config()
    Handler.config = config
    try:
        log.info('using printer: %s', resolve_printer(config.get('printer')))
    except Exception:
        log.exception('no printer available at startup')
    server = ThreadingHTTPServer((DEFAULT_HOST, int(config['port'])), Handler)
    log.info('listening on %s:%s', DEFAULT_HOST, config['port'])
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
