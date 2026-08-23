"""
Counter screen styling.

Dark and high-contrast on purpose: the operator reads this from arm's length across a serving
counter, often with a queue waiting, so everything that matters is large and the success/failure
distinction is carried by colour *and* by text.
"""

BG = '#12151c'
PANEL = '#1c2230'
PANEL_SOFT = '#242c3d'
TEXT = '#eef2f8'
MUTED = '#8b97ad'
ACCENT = '#4da3ff'
OK = '#2ecc71'
OK_BG = '#123524'
WARN = '#f0b429'
WARN_BG = '#3a2c08'
ERR = '#ff5f56'
ERR_BG = '#3a1512'

STYLESHEET = """
QWidget {{
    background: {bg};
    color: {text};
    font-family: 'Segoe UI', 'Nirmala UI', sans-serif;
}}

#header {{
    background: {panel};
    border-bottom: 1px solid #2b3446;
}}
#appTitle   {{ font-size: 22px; font-weight: 600; letter-spacing: 1px; }}
#clock      {{ font-size: 26px; font-weight: 600; }}
#mealBadge  {{
    background: {panel_soft};
    border: 2px solid {accent};
    border-radius: 10px;
    padding: 8px 22px;
    font-size: 24px;
    font-weight: 700;
    color: {accent};
}}
#mealBadge[state="inactive"] {{ border-color: {muted}; color: {muted}; }}
#mealCost   {{ font-size: 15px; color: {muted}; }}

#statusDot  {{ font-size: 15px; color: {muted}; }}
#statusDot[state="ok"]   {{ color: {ok}; }}
#statusDot[state="warn"] {{ color: {warn}; }}
#statusDot[state="bad"]  {{ color: {err}; }}

#prompt      {{ font-size: 46px; font-weight: 700; color: {muted}; }}
#promptHint  {{ font-size: 20px; color: {muted}; }}

#photoFrame {{
    background: {panel};
    border: 2px solid #2b3446;
    border-radius: 14px;
}}
#initials {{
    background: {panel_soft};
    border-radius: 14px;
    font-size: 96px;
    font-weight: 700;
    color: {muted};
}}

#memberName  {{ font-size: 44px; font-weight: 700; }}
#memberMeta  {{ font-size: 21px; color: {muted}; }}
#memberDue   {{ font-size: 21px; color: {warn}; }}

#banner {{ border-radius: 14px; padding: 18px 26px; }}
#banner[state="ok"]   {{ background: {ok_bg};   border: 2px solid {ok}; }}
#banner[state="warn"] {{ background: {warn_bg}; border: 2px solid {warn}; }}
#banner[state="bad"]  {{ background: {err_bg};  border: 2px solid {err}; }}
#bannerToken {{ font-size: 60px; font-weight: 800; }}
#bannerText  {{ font-size: 24px; font-weight: 600; }}
#bannerSub   {{ font-size: 17px; color: {muted}; }}

#mealPicker QPushButton {{
    background: {panel};
    border: 2px solid #2b3446;
    border-radius: 12px;
    padding: 14px 30px;
    font-size: 21px;
    font-weight: 600;
    color: {muted};
}}
#mealPicker QPushButton:checked {{
    border-color: {accent};
    color: {accent};
    background: {panel_soft};
}}

#footer {{ background: {panel}; border-top: 1px solid #2b3446; }}
#footer QLabel {{ font-size: 14px; color: {muted}; }}

#cardInput {{
    background: {panel};
    border: 2px solid #2b3446;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 20px;
    color: {muted};
}}
#cardInput:focus {{ border-color: {accent}; }}

QMessageBox {{ background: {panel}; }}
QMessageBox QLabel {{ font-size: 16px; }}
QMessageBox QPushButton {{
    background: {panel_soft};
    border: 1px solid #2b3446;
    border-radius: 6px;
    padding: 8px 20px;
    font-size: 15px;
}}
""".format(bg=BG, panel=PANEL, panel_soft=PANEL_SOFT, text=TEXT, muted=MUTED, accent=ACCENT,
           ok=OK, ok_bg=OK_BG, warn=WARN, warn_bg=WARN_BG, err=ERR, err_bg=ERR_BG)
