# ============================================================
# passenger_wsgi.py — AHost.uz shared hosting uchun
# Bu fayl public_html/ papkasiga joylashadi
# ============================================================
#
# AHost cPanel "Setup Python App" orqali avtomatik yaratiladi.
# Agar qo'lda yaratayotgan bo'lsangiz, quyidagi yo'llarni
# o'zingizning username va loyiha nomiga moslab o'zgartiring.
# ============================================================

import os
import sys

# ==== YO'LLARNI O'ZGARTIRING ====
# AHost'dagi home papkangiz: /home/USERNAME
# Loyiha papkasi: /home/USERNAME/zarifsblog
# Virtual environment: /home/USERNAME/virtualenv/zarifsblog/3.11

HOMEDIR = os.path.expanduser("~")  # /home/username
PROJECT_DIR = os.path.join(HOMEDIR, "zarifsblog")  # Django loyiha papkasi
VENV_DIR = os.path.join(HOMEDIR, "virtualenv", "zarifsblog", "3.11")

# Virtual environment'ni aktivlashtirish
venv_site = os.path.join(VENV_DIR, "lib", "python3.11", "site-packages")
if os.path.isdir(venv_site):
    sys.path.insert(0, venv_site)

# Loyiha papkasini Python path'ga qo'shish
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

# Django settings moduli
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
# Agar sizning Django loyihangizda settings.py boshqa nomda bo'lsa:
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

# ==== WSGI APPLICATION ====
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception as e:
    # Xatolik bo'lsa — brauzerda ko'rsatish (debug uchun)
    import traceback

    def application(environ, start_response):
        status = "500 Internal Server Error"
        output = traceback.format_exc().encode("utf-8")
        start_response(status, [
            ("Content-Type", "text/plain; charset=utf-8"),
            ("Content-Length", str(len(output))),
        ])
        return [output]
