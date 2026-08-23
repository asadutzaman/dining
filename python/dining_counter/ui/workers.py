"""
Background work.

Nothing that touches MySQL, the network or the printer may run on the UI thread. A stalled DB
socket freezing the counter screen mid-queue is exactly the failure this app exists to remove.
"""

import logging

from PySide6.QtCore import QObject, QRunnable, Signal, Slot

from .. import journal
from ..issue import IssueError, issue_token
from ..meals import detect

log = logging.getLogger('dining-counter.workers')


class ScanSignals(QObject):
    memberFound = Signal(dict)
    memberMissing = Signal(str)
    issued = Signal(dict)
    failed = Signal(dict, str)   # member (possibly empty), message
    crashed = Signal(str)


class ScanWorker(QRunnable):
    """
    Resolve the card, then issue.

    The member is emitted as soon as it is known, before the token is attempted, so the operator
    sees *who* is at the counter even when issuance goes on to fail. The commonest rejection is
    "already issued for this meal today", and the operator has to tell that specific person.
    """

    def __init__(self, db, repo, config, card, meal_type, dry_run=False):
        super().__init__()
        self.db = db
        self.repo = repo
        self.config = config
        self.card = card
        self.meal_type = meal_type
        self.dry_run = dry_run
        self.signals = ScanSignals()

    @Slot()
    def run(self):
        try:
            with self.db.read() as cur:
                member = self.repo.find_member_by_card(cur, self.card)
        except Exception as exc:
            log.exception('card lookup failed')
            self.signals.crashed.emit('Database unavailable: %s' % exc)
            return

        if not member:
            journal.rejected(self.card, None, self.meal_type, 'unknown card')
            self.signals.memberMissing.emit(self.card)
            return

        member = dict(member)
        self.signals.memberFound.emit(member)

        if int(member.get('status') or 0) != 1:
            message = 'Member not found or inactive!'
            journal.rejected(self.card, member.get('id'), self.meal_type, message)
            self.signals.failed.emit(member, message)
            return

        try:
            receipt = issue_token(self.db, self.repo, self.config, member['id'],
                                  self.meal_type, dry_run=self.dry_run)
        except IssueError as exc:
            journal.rejected(self.card, member.get('id'), self.meal_type, str(exc))
            self.signals.failed.emit(member, str(exc))
            return
        except Exception as exc:
            log.exception('issue failed')
            journal.rejected(self.card, member.get('id'), self.meal_type, repr(exc))
            self.signals.failed.emit(member, 'Could not issue the token: %s' % exc)
            return

        journal.issued(self.card, receipt)
        self.signals.issued.emit(receipt)


class PhotoSignals(QObject):
    ready = Signal(int, object)   # member id, bytes or None


class PhotoWorker(QRunnable):
    def __init__(self, resolver, member):
        super().__init__()
        self.resolver = resolver
        self.member = member
        self.signals = PhotoSignals()

    @Slot()
    def run(self):
        try:
            payload = self.resolver.fetch(self.member)
        except Exception:
            log.exception('photo fetch failed')
            payload = None
        self.signals.ready.emit(int(self.member.get('id') or 0), payload)


class PrintSignals(QObject):
    done = Signal(str, dict)


class PrintWorker(QRunnable):
    """
    Printing is deliberately off the scan critical path: the card field is free for the next
    punch the moment the token commits, and the slip catches up a beat later.
    """

    def __init__(self, printer, receipt):
        super().__init__()
        self.printer = printer
        self.receipt = receipt
        self.signals = PrintSignals()

    @Slot()
    def run(self):
        result = self.printer.print_token(self.receipt)
        journal.printed(self.receipt.get('token_number'), result)
        self.signals.done.emit(self.receipt.get('token_number') or '', result)


class MealSignals(QObject):
    ready = Signal(object)   # MealStatus, or None when the lookup failed


class MealWorker(QRunnable):
    def __init__(self, db, repo):
        super().__init__()
        self.db = db
        self.repo = repo
        self.signals = MealSignals()

    @Slot()
    def run(self):
        try:
            self.signals.ready.emit(detect(self.db, self.repo))
        except Exception:
            # Not fatal. The screen treats it as "no windows known" and offers the manual picker,
            # which keeps the counter serving through a database hiccup.
            log.exception('current-meal lookup failed')
            self.signals.ready.emit(None)


class HealthSignals(QObject):
    ready = Signal(dict)


class HealthWorker(QRunnable):
    def __init__(self, db, printer):
        super().__init__()
        self.db = db
        self.printer = printer
        self.signals = HealthSignals()

    @Slot()
    def run(self):
        health = {'db': False, 'db_error': '', 'printer': '', 'blocking': '', 'advisory': '',
                  'printer_error': ''}
        try:
            health['db'] = bool(self.db.check())
        except Exception as exc:
            health['db_error'] = str(exc)
        try:
            health['printer'] = self.printer.name()
            state = self.printer.state()
            health['blocking'] = state['blocking']
            health['advisory'] = state['advisory']
        except Exception as exc:
            health['printer_error'] = str(exc)
        self.signals.ready.emit(health)
