import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','geotag.settings')
import django
django.setup()
from django.template.loader import get_template
import traceback

try:
    t = get_template('login.html')
    print('Loaded template:', getattr(t, 'name', repr(t)))
except Exception:
    traceback.print_exc()
