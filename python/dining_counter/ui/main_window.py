"""
The counter screen.

One window, one job: a card goes in, a token comes out. Every rule below that looks fussy is
there because the counter is used at speed by someone with a queue in front of them.
"""

import datetime as dt
import logging

from PySide6.QtCore import Qt, QThreadPool, QTimer, QEvent
from PySide6.QtGui import QKeySequence, QPixmap, QShortcut
from PySide6.QtWidgets import (QFrame, QHBoxLayout, QLabel, QLineEdit, QMainWindow, QMessageBox,
                               QPushButton, QSizePolicy, QVBoxLayout, QWidget)

from ..meals import MealStatus
from ..photos import PhotoResolver, initials
from ..repository import MEAL_LABEL, MEAL_TYPES
from .styles import STYLESHEET
from .workers import HealthWorker, MealWorker, PhotoWorker, PrintWorker, ScanWorker

log = logging.getLogger('dining-counter.ui')

PHOTO_W, PHOTO_H = 300, 380
HEALTH_INTERVAL_MS = 15000
REFOCUS_INTERVAL_MS = 750


class MainWindow(QMainWindow):
    def __init__(self, db, repo, config, printer, dry_run=False):
        super().__init__()
        self.db = db
        self.repo = repo
        self.config = config
        self.printer = printer
        self.dry_run = dry_run

        self.photos = PhotoResolver(config)
        self.pool = QThreadPool.globalInstance()

        # False until the first current-meal lookup settles, success *or* failure. Load-bearing:
        # without it a card punched during startup issues a token for whatever meal the screen
        # happens to default to -- a breakfast token at dinner -- silently and irreversibly.
        self.meal_loaded = False
        self.meal_status = MealStatus()
        self.manual_meal = 'LUNCH'
        self.current_member_id = None
        self._busy = False
        self._modal = False

        self.setWindowTitle('%s - Meal Token Counter' % config.title)
        self.setStyleSheet(STYLESHEET)
        self._build()
        self._wire()
        self._start_timers()
        self.show_idle()

    # --- construction -------------------------------------------------------------------------

    def _build(self):
        root = QWidget()
        layout = QVBoxLayout(root)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        layout.addWidget(self._build_header())

        body = QWidget()
        self.body_layout = QVBoxLayout(body)
        self.body_layout.setContentsMargins(40, 28, 40, 20)
        self.body_layout.setSpacing(20)

        self.prompt = QLabel('Punch your card')
        self.prompt.setObjectName('prompt')
        self.prompt.setAlignment(Qt.AlignCenter)

        self.prompt_hint = QLabel('')
        self.prompt_hint.setObjectName('promptHint')
        self.prompt_hint.setAlignment(Qt.AlignCenter)

        self.member_panel = self._build_member_panel()
        self.banner = self._build_banner()

        self.body_layout.addStretch(1)
        self.body_layout.addWidget(self.prompt)
        self.body_layout.addWidget(self.prompt_hint)
        self.body_layout.addWidget(self.member_panel)
        self.body_layout.addWidget(self.banner)
        self.body_layout.addStretch(1)
        self.body_layout.addWidget(self._build_meal_picker(), 0, Qt.AlignCenter)

        layout.addWidget(body, 1)
        layout.addWidget(self._build_footer())
        self.setCentralWidget(root)

    def _build_header(self):
        header = QFrame()
        header.setObjectName('header')
        row = QHBoxLayout(header)
        row.setContentsMargins(28, 14, 28, 14)
        row.setSpacing(20)

        self.title_label = QLabel(self.config.title)
        self.title_label.setObjectName('appTitle')

        meal_box = QVBoxLayout()
        meal_box.setSpacing(2)
        self.meal_badge = QLabel('Loading...')
        self.meal_badge.setObjectName('mealBadge')
        self.meal_badge.setAlignment(Qt.AlignCenter)
        self.meal_cost = QLabel('')
        self.meal_cost.setObjectName('mealCost')
        self.meal_cost.setAlignment(Qt.AlignCenter)
        meal_box.addWidget(self.meal_badge)
        meal_box.addWidget(self.meal_cost)

        self.db_dot = QLabel('* Database')
        self.db_dot.setObjectName('statusDot')
        self.printer_dot = QLabel('* Printer')
        self.printer_dot.setObjectName('statusDot')
        dots = QVBoxLayout()
        dots.setSpacing(2)
        dots.addWidget(self.db_dot)
        dots.addWidget(self.printer_dot)

        self.clock = QLabel('')
        self.clock.setObjectName('clock')

        row.addWidget(self.title_label)
        row.addStretch(1)
        row.addLayout(meal_box)
        row.addStretch(1)
        row.addLayout(dots)
        row.addWidget(self.clock)
        return header

    def _build_member_panel(self):
        panel = QWidget()
        row = QHBoxLayout(panel)
        row.setContentsMargins(0, 0, 0, 0)
        row.setSpacing(34)

        self.photo = QLabel()
        self.photo.setObjectName('photoFrame')
        self.photo.setFixedSize(PHOTO_W, PHOTO_H)
        self.photo.setAlignment(Qt.AlignCenter)
        self.photo.setScaledContents(False)

        details = QVBoxLayout()
        details.setSpacing(10)
        self.member_name = QLabel('')
        self.member_name.setObjectName('memberName')
        self.member_name.setWordWrap(True)
        self.member_meta = QLabel('')
        self.member_meta.setObjectName('memberMeta')
        self.member_extra = QLabel('')
        self.member_extra.setObjectName('memberMeta')
        self.member_due = QLabel('')
        self.member_due.setObjectName('memberDue')
        details.addStretch(1)
        details.addWidget(self.member_name)
        details.addWidget(self.member_meta)
        details.addWidget(self.member_extra)
        details.addWidget(self.member_due)
        details.addStretch(1)

        row.addStretch(1)
        row.addWidget(self.photo)
        row.addLayout(details, 2)
        row.addStretch(1)
        panel.hide()
        return panel

    def _build_banner(self):
        banner = QFrame()
        banner.setObjectName('banner')
        banner.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Maximum)
        col = QVBoxLayout(banner)
        col.setSpacing(4)
        self.banner_token = QLabel('')
        self.banner_token.setObjectName('bannerToken')
        self.banner_token.setAlignment(Qt.AlignCenter)
        self.banner_text = QLabel('')
        self.banner_text.setObjectName('bannerText')
        self.banner_text.setAlignment(Qt.AlignCenter)
        self.banner_text.setWordWrap(True)
        self.banner_sub = QLabel('')
        self.banner_sub.setObjectName('bannerSub')
        self.banner_sub.setAlignment(Qt.AlignCenter)
        col.addWidget(self.banner_token)
        col.addWidget(self.banner_text)
        col.addWidget(self.banner_sub)
        banner.hide()
        return banner

    def _build_meal_picker(self):
        self.meal_picker = QWidget()
        self.meal_picker.setObjectName('mealPicker')
        row = QHBoxLayout(self.meal_picker)
        row.setContentsMargins(0, 0, 0, 0)
        row.setSpacing(14)
        self.meal_buttons = {}
        for meal in MEAL_TYPES:
            button = QPushButton(MEAL_LABEL[meal])
            button.setCheckable(True)
            button.setChecked(meal == self.manual_meal)
            button.setFocusPolicy(Qt.NoFocus)   # never steal focus from the card field
            button.clicked.connect(lambda _checked, m=meal: self._pick_meal(m))
            self.meal_buttons[meal] = button
            row.addWidget(button)
        self.meal_picker.hide()
        return self.meal_picker

    def _build_footer(self):
        footer = QFrame()
        footer.setObjectName('footer')
        row = QHBoxLayout(footer)
        row.setContentsMargins(28, 8, 28, 8)

        # The reader is a keyboard wedge: it types the card number and presses Enter. The field
        # stays visible but muted so the operator can see keystrokes are landing somewhere, and
        # can type a number by hand if a card is unreadable.
        self.card_input = QLineEdit()
        self.card_input.setObjectName('cardInput')
        self.card_input.setPlaceholderText('Card number')
        self.card_input.setFixedWidth(260)
        self.card_input.setAlignment(Qt.AlignCenter)

        self.footer_left = QLabel('')
        self.footer_right = QLabel('Ctrl+Shift+Q to exit')
        row.addWidget(self.footer_left)
        row.addStretch(1)
        row.addWidget(self.card_input)
        row.addStretch(1)
        row.addWidget(self.footer_right)
        return footer

    def _wire(self):
        self.card_input.returnPressed.connect(self.handle_scan)
        quit_shortcut = QShortcut(QKeySequence('Ctrl+Shift+Q'), self)
        quit_shortcut.activated.connect(self.confirm_exit)
        mode = 'DRY RUN - nothing is saved' if self.dry_run else ''
        self.footer_left.setText(
            '%s@%s  |  %s' % (self.config.db['database'], self.config.db['host'],
                              mode or 'live'))

    def _start_timers(self):
        self._tick_clock()
        self.clock_timer = QTimer(self)
        self.clock_timer.timeout.connect(self._tick_clock)
        self.clock_timer.start(1000)

        # Rolls the screen from one sitting to the next unattended.
        self.meal_timer = QTimer(self)
        self.meal_timer.timeout.connect(self.refresh_meal)
        self.meal_timer.start(self.config.meal_poll_seconds * 1000)
        self.refresh_meal()

        self.health_timer = QTimer(self)
        self.health_timer.timeout.connect(self.refresh_health)
        self.health_timer.start(HEALTH_INTERVAL_MS)
        self.refresh_health()

        # The card field must own the keyboard. Anything that steals focus -- a stray click, a
        # dialog closing, Windows raising a balloon -- silently sends the next scan nowhere, so
        # focus is reclaimed on a timer rather than only at the points we think matter.
        self.focus_timer = QTimer(self)
        self.focus_timer.timeout.connect(self._reclaim_focus)
        self.focus_timer.start(REFOCUS_INTERVAL_MS)

        self.result_timer = QTimer(self)
        self.result_timer.setSingleShot(True)
        self.result_timer.timeout.connect(self.show_idle)

    # --- focus --------------------------------------------------------------------------------

    def _reclaim_focus(self):
        if self._modal:
            return
        if not self.card_input.hasFocus():
            self.card_input.setFocus(Qt.OtherFocusReason)

    def refocus(self):
        self.card_input.clear()
        QTimer.singleShot(30, self._reclaim_focus)

    def changeEvent(self, event):
        if event.type() == QEvent.ActivationChange and self.isActiveWindow():
            QTimer.singleShot(30, self._reclaim_focus)
        super().changeEvent(event)

    # --- periodic -----------------------------------------------------------------------------

    def _tick_clock(self):
        self.clock.setText(dt.datetime.now().strftime('%H:%M:%S'))

    def refresh_meal(self):
        worker = MealWorker(self.db, self.repo)
        worker.signals.ready.connect(self._meal_ready)
        self.pool.start(worker)

    def _meal_ready(self, status):
        # A failed lookup is not fatal: fall back to "no windows known" and the manual picker.
        self.meal_status = status if status is not None else MealStatus()
        self.meal_loaded = True
        self._render_meal()
        # The poll settles a moment after the window opens, and again at every rollover between
        # sittings. Either way the idle hint is now stale, so redraw it -- but only when the
        # screen is actually idle, so a poll never wipes a member or a result out from under the
        # operator.
        if not self.member_panel.isVisible() and not self.banner.isVisible():
            self._refresh_hint()

    def _render_meal(self):
        status = self.meal_status
        if not status.windows_configured:
            self.meal_picker.show()
            self.meal_badge.setText(MEAL_LABEL[self.manual_meal])
            self.meal_badge.setProperty('state', 'active')
            self.meal_cost.setText('Choose the meal being served')
        else:
            self.meal_picker.hide()
            if status.meal_type:
                self.meal_badge.setText(MEAL_LABEL[status.meal_type])
                self.meal_badge.setProperty('state', 'active')
                self.meal_cost.setText('%s  |  Tk %s' % (
                    status.window_text(), _money(status.cost)))
            else:
                self.meal_badge.setText('No meal now')
                self.meal_badge.setProperty('state', 'inactive')
                self.meal_cost.setText('Between sittings')
        self.meal_badge.style().unpolish(self.meal_badge)
        self.meal_badge.style().polish(self.meal_badge)

    def _pick_meal(self, meal):
        self.manual_meal = meal
        for name, button in self.meal_buttons.items():
            button.setChecked(name == meal)
        self._render_meal()
        self._reclaim_focus()

    def refresh_health(self):
        worker = HealthWorker(self.db, self.printer)
        worker.signals.ready.connect(self._health_ready)
        self.pool.start(worker)

    def _health_ready(self, health):
        if health['db']:
            _set_state(self.db_dot, 'ok', '* Database')
            self.db_dot.setToolTip('')
        else:
            _set_state(self.db_dot, 'bad', '* Database')
            self.db_dot.setToolTip(health['db_error'])

        if health['printer_error']:
            _set_state(self.printer_dot, 'bad', '* Printer')
            self.printer_dot.setToolTip(health['printer_error'])
        elif health['blocking']:
            _set_state(self.printer_dot, 'bad', '* %s' % health['blocking'])
            self.printer_dot.setToolTip(health['blocking'])
        elif health['advisory']:
            _set_state(self.printer_dot, 'warn', '* Printer')
            self.printer_dot.setToolTip(health['advisory'])
        else:
            _set_state(self.printer_dot, 'ok', '* Printer')
            self.printer_dot.setToolTip(health['printer'])

    # --- the scan -----------------------------------------------------------------------------

    def active_meal(self):
        if not self.meal_status.windows_configured:
            return self.manual_meal
        return self.meal_status.meal_type

    def handle_scan(self):
        card = self.card_input.text().strip()
        if not card:
            return
        if self._busy:
            # A double punch while the previous one is still committing would otherwise queue a
            # second worker against the same card.
            self.refocus()
            return

        if not self.meal_loaded:
            self.show_message('warn', 'Still loading the current meal - scan again in a moment.')
            self.refocus()
            return

        meal = self.active_meal()
        if not meal:
            self.show_message('warn', 'No meal is being served right now.',
                              'Check the meal time windows in the admin panel.')
            self.refocus()
            return

        self._busy = True
        self.result_timer.stop()
        self._clear_member()
        self.prompt.setText('Reading card...')
        self.prompt.show()
        self.prompt_hint.hide()
        self.banner.hide()

        worker = ScanWorker(self.db, self.repo, self.config, card, meal, dry_run=self.dry_run)
        worker.signals.memberFound.connect(self._member_found)
        worker.signals.memberMissing.connect(self._member_missing)
        worker.signals.issued.connect(self._issued)
        worker.signals.failed.connect(self._issue_failed)
        worker.signals.crashed.connect(self._crashed)
        self.pool.start(worker)
        self.refocus()

    def _member_found(self, member):
        self.current_member_id = int(member.get('id') or 0)
        self.prompt.hide()
        self.prompt_hint.hide()

        self.member_name.setText(member.get('name') or '')
        bits = [member.get('member_code') or '', (member.get('member_type') or '').title()]
        self.member_meta.setText('  |  '.join(b for b in bits if b))
        self.member_extra.setText(_member_extra(member))
        self.member_due.setText('Current due: Tk %s' % _money(member.get('due_balance')))
        self._set_placeholder_photo(member.get('name'))
        self.member_panel.show()

        worker = PhotoWorker(self.photos, member)
        worker.signals.ready.connect(self._photo_ready)
        self.pool.start(worker)

    def _photo_ready(self, member_id, payload):
        # The operator may already have scanned the next card; only paint if it is still theirs.
        if member_id != self.current_member_id or not payload:
            return
        pixmap = QPixmap()
        if not pixmap.loadFromData(payload):
            return
        self.photo.setPixmap(pixmap.scaled(PHOTO_W - 8, PHOTO_H - 8,
                                           Qt.KeepAspectRatio, Qt.SmoothTransformation))
        self.photo.setObjectName('photoFrame')
        self.photo.setStyleSheet('')

    def _set_placeholder_photo(self, name):
        self.photo.setPixmap(QPixmap())
        self.photo.setObjectName('initials')
        self.photo.setText(initials(name))
        self.photo.style().unpolish(self.photo)
        self.photo.style().polish(self.photo)

    def _member_missing(self, card):
        self._busy = False
        self.show_message(
            'bad',
            'Card not recognised.',
            'Card %s is not linked to any member. Enrol them in the admin panel first.' % card)

    def _issued(self, receipt):
        self._busy = False
        self.banner.setProperty('state', 'ok')
        self.banner_token.setText(receipt['token_number'])
        suffix = ' (dry run - not saved)' if receipt.get('dry_run') else ''
        self.banner_text.setText('%s  -  Tk %s%s' % (
            MEAL_LABEL.get(receipt['meal_type'], receipt['meal_type']),
            receipt['amount'], suffix))
        self.banner_sub.setText('Printing...' if self.config.printer_enabled
                                else 'Printing is disabled in config.ini')
        self.member_due.setText('New due: Tk %s' % receipt['due_after'])
        _repolish(self.banner)
        self.banner.show()
        self.result_timer.start(self.config.result_seconds * 1000)

        if self.config.printer_enabled and not receipt.get('dry_run'):
            worker = PrintWorker(self.printer, receipt)
            worker.signals.done.connect(self._print_done)
            self.pool.start(worker)
        elif receipt.get('dry_run'):
            self.banner_sub.setText('Dry run - nothing printed, nothing saved')

    def _print_done(self, token_number, result):
        if token_number != self.banner_token.text():
            return   # a later token is on screen already
        if result.get('ok'):
            self.banner_sub.setText('Printed%s' % (
                ' - %s' % result['advisory'] if result.get('advisory') else ''))
            return
        # The token is committed either way. Say so plainly rather than let the operator assume a
        # slip is coming.
        reason = result.get('blocking') or result.get('error') or 'printer unavailable'
        self.banner.setProperty('state', 'warn')
        _repolish(self.banner)
        self.banner_sub.setText('Token issued but NOT printed - %s' % reason)
        # Hold a failed print on screen longer; this one needs acting on.
        self.result_timer.start(max(self.config.result_seconds, 15) * 1000)

    def _issue_failed(self, member, message):
        self._busy = False
        # The member stays on screen beside the error -- the operator has to tell this specific
        # person why they were refused.
        self.banner.setProperty('state', 'bad')
        self.banner_token.setText('')
        self.banner_token.hide()
        self.banner_text.setText(message)
        self.banner_sub.setText('')
        _repolish(self.banner)
        self.banner.show()
        self.result_timer.start(max(self.config.result_seconds, 10) * 1000)

    def _crashed(self, message):
        self._busy = False
        self.show_message('bad', 'Database unavailable', message)

    # --- screen states ------------------------------------------------------------------------

    def show_idle(self):
        self._busy = False
        self._clear_member()
        self.banner.hide()
        self.prompt.setText('Punch your card')
        self.prompt.show()
        self._refresh_hint()
        self.refocus()

    def _refresh_hint(self):
        meal = self.active_meal()
        if not self.meal_loaded:
            self.prompt_hint.setText('Loading the current meal...')
        elif meal:
            self.prompt_hint.setText('Issuing %s tokens' % MEAL_LABEL.get(meal, meal).lower())
        else:
            self.prompt_hint.setText('No meal is being served right now')
        self.prompt_hint.show()

    def show_message(self, state, text, sub=''):
        self._clear_member()
        self.prompt.hide()
        self.prompt_hint.hide()
        self.banner.setProperty('state', state)
        self.banner_token.setText('')
        self.banner_token.hide()
        self.banner_text.setText(text)
        self.banner_sub.setText(sub)
        _repolish(self.banner)
        self.banner.show()
        self.result_timer.start(self.config.result_seconds * 1000)

    def _clear_member(self):
        self.current_member_id = None
        self.member_panel.hide()
        self.banner_token.show()

    # --- exit ---------------------------------------------------------------------------------

    def confirm_exit(self):
        self._modal = True
        try:
            answer = QMessageBox.question(
                self, 'Close the counter?',
                'Close the meal token counter?\n\nNo more tokens can be issued until it is '
                'restarted.',
                QMessageBox.Yes | QMessageBox.No, QMessageBox.No)
        finally:
            self._modal = False
        if answer == QMessageBox.Yes:
            self.close()
        else:
            self._reclaim_focus()

    def closeEvent(self, event):
        try:
            self.db.close()
        except Exception:
            pass
        super().closeEvent(event)


# --- helpers --------------------------------------------------------------------------------

def _money(value):
    try:
        return '%.2f' % float(value)
    except (TypeError, ValueError):
        return '0.00'


def _member_extra(member):
    if (member.get('member_type') or '').upper() == 'STUDENT':
        bits = [member.get('class_name'), member.get('section'),
                'Roll %s' % member['roll_no'] if member.get('roll_no') else None]
    else:
        bits = ['Staff ID %s' % member['staff_id'] if member.get('staff_id') else None]
    return '  |  '.join(b for b in bits if b)


def _repolish(widget):
    widget.style().unpolish(widget)
    widget.style().polish(widget)


def _set_state(label, state, text):
    label.setText(text)
    label.setProperty('state', state)
    _repolish(label)
