"""Panel sessions: who is signed in from where, and ending them."""

import re
from datetime import timedelta

from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.contrib.sessions.models import Session
from django.dispatch import receiver
from django.utils import timezone

from api.models import LoginMethod, UserSession

# last activity is written at most once a minute, not on every request
TOUCH_INTERVAL = timedelta(minutes=1)


def client_ip(request):
    # behind two nginx: the first address in X-Forwarded-For is the browser
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    return forwarded.split(',')[0].strip() or request.META.get('REMOTE_ADDR') or None


def describe_agent(user_agent):
    """«Chrome · Windows» out of a User-Agent string; no library for two words."""
    browsers = [('Edge', r'Edg/'), ('Opera', r'OPR/'), ('Yandex', r'YaBrowser/'), ('Firefox', r'Firefox/'),
                ('Chrome', r'Chrome/'), ('Safari', r'Safari/')]
    systems = [('iPhone', r'iPhone'), ('iPad', r'iPad'), ('Android', r'Android'), ('Windows', r'Windows'),
               ('macOS', r'Mac OS X'), ('Linux', r'Linux')]
    browser = next((name for name, pattern in browsers if re.search(pattern, user_agent)), '')
    system = next((name for name, pattern in systems if re.search(pattern, user_agent)), '')
    if not browser and 'curl' in user_agent.lower():
        browser = 'curl'
    return ' · '.join(part for part in (browser, system) if part) or 'Неизвестное устройство'


@receiver(user_logged_in)
def remember_session(sender, request, user, **kwargs):
    if request is None or not request.session.session_key:
        return
    method = LoginMethod.SSO if '/auth/oidc/' in request.path else LoginMethod.PASSWORD
    UserSession.objects.update_or_create(
        session_key=request.session.session_key,
        defaults={
            'user': user, 'method': method, 'ip': client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:500],
        },
    )


@receiver(user_logged_out)
def forget_session(sender, request, user, **kwargs):
    if request is not None and request.session.session_key:
        UserSession.objects.filter(session_key=request.session.session_key).delete()


def active_sessions(user):
    """Sessions that still work: the Django session exists and has not expired. Dead rows are removed."""
    rows = list(UserSession.objects.filter(user=user))
    alive = set(
        Session.objects.filter(session_key__in=[row.session_key for row in rows], expire_date__gt=timezone.now())
        .values_list('session_key', flat=True)
    )
    dead = [row.pk for row in rows if row.session_key not in alive]
    if dead:
        UserSession.objects.filter(pk__in=dead).delete()
    return [row for row in rows if row.session_key in alive]


def end_session(row):
    Session.objects.filter(session_key=row.session_key).delete()
    row.delete()


class SessionActivityMiddleware:
    """Updates «последняя активность» of the current session."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        user = getattr(request, 'user', None)
        key = request.session.session_key if hasattr(request, 'session') else None
        if key and user is not None and user.is_authenticated:
            now = timezone.now()
            UserSession.objects.filter(session_key=key, last_seen_at__lt=now - TOUCH_INTERVAL).update(last_seen_at=now)
        return response
