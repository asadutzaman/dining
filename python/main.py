"""
Dining counter -- entry point.

Double-click the exe and the scan window opens. No login, no browser, no API: the card goes in,
the token is written to MySQL, the receipt comes out of the thermal printer.

    main.py                 run the counter
    main.py --dry-run       full screen and full reads, but every issue rolls back
    main.py --self-test     preflight checks, no window
    main.py --test-print    print one sample receipt, no database writes
    main.py --preview FILE  render a sample receipt to a PNG instead of printing it
"""

import argparse
import datetime as dt
import logging
import os
import sys
from logging.handlers import RotatingFileHandler

from dining_counter import config as config_module
from dining_counter.db import Database
from dining_counter.repository import Repository

SAMPLE = {
    'token_number': 'TKN-9999',
    'meal_type': 'DINNER',
    'meal_date': dt.date.today().strftime('%Y-%m-%d'),
    'amount': '60.00',
    'created_at': dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    # Deliberately Bengali: this is the case the old text-mode receipt printed as '?'.
    'member_name': 'মোহাম্মদ আসাদুজ্জামান',
    'member_code': 'MEM-0001',
}


def setup_logging():
    handler = RotatingFileHandler(
        os.path.join(config_module.app_dir(), 'dining-counter.log'),
        maxBytes=512000, backupCount=3, encoding='utf-8')
    handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s'))
    root = logging.getLogger()
    root.addHandler(handler)
    root.setLevel(logging.INFO)


def parse_args():
    parser = argparse.ArgumentParser(description='Dining meal token counter')
    parser.add_argument('--config', help='path to config.ini')
    parser.add_argument('--dry-run', action='store_true',
                        help='run the full screen but roll back every token')
    parser.add_argument('--printer-test', action='store_true',
                        help='like --dry-run but DOES print: scan a real card repeatedly to '
                             'test the printer without issuing anything')
    parser.add_argument('--self-test', action='store_true', help='run preflight checks and exit')
    parser.add_argument('--test-print', action='store_true',
                        help='print one sample receipt and exit')
    parser.add_argument('--preview', metavar='FILE',
                        help='render a sample receipt to a PNG and exit')
    parser.add_argument('--windowed', action='store_true',
                        help='ignore the fullscreen setting (useful while testing)')
    return parser.parse_args()


def main():
    args = parse_args()
    setup_logging()
    config = config_module.load(args.config)

    if args.self_test:
        from dining_counter.selftest import run
        return run(config)

    if args.preview:
        from dining_counter.printing import save_preview
        path = save_preview(SAMPLE, args.preview, font_path=config.font_path,
                            title=config.title)
        print('Wrote %s' % path)
        return 0

    if args.test_print:
        from dining_counter.printing import ReceiptPrinter, has_shaping
        if not has_shaping():
            print('Warning: this Pillow build has no Raqm, so Bengali will be mis-shaped.')
        result = ReceiptPrinter(config).print_token(SAMPLE)
        if result.get('ok'):
            print('Printed a sample receipt on %s.' % result.get('printer'))
            return 0
        print('Not printed: %s' % (result.get('blocking') or result.get('error') or 'unknown'))
        return 1

    from PySide6.QtWidgets import QApplication
    from dining_counter.printing import ReceiptPrinter
    from dining_counter.ui.main_window import MainWindow

    db = Database(config.db)
    repo = Repository(config.prefix)
    printer = ReceiptPrinter(config)

    app = QApplication(sys.argv)
    app.setApplicationName('Dining Counter')
    # --printer-test prints a real receipt but writes nothing at all -- no token, no sequence
    # advance, no balance change -- and skips the one-per-member-per-meal rule, so the same card
    # can be punched as many times as the paper lasts. Also settable as [app] printer_test in
    # config.ini, because the counter is usually launched from a shortcut with nowhere to put a
    # flag.
    printer_test = args.printer_test or config.printer_test
    dry_run = args.dry_run or printer_test

    # Say the mode out loud at startup. Without this line the only way to tell a live run from a
    # test run after the fact is to infer it from what the journal did or did not record.
    logging.getLogger('dining-counter').info(
        'starting: mode=%s config=%s',
        'PRINTER TEST (prints, saves nothing)' if printer_test
        else 'DRY RUN (saves nothing)' if dry_run else 'LIVE',
        config.path)

    window = MainWindow(
        db, repo, config, printer,
        dry_run=dry_run,
        print_in_dry_run=printer_test,
    )
    if config.fullscreen and not args.windowed:
        window.showFullScreen()
    else:
        window.resize(1280, 800)
        window.show()
    return app.exec()


if __name__ == '__main__':
    sys.exit(main())
