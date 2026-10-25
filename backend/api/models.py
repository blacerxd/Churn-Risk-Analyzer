from django.conf import settings
from django.db import models


class LoginMethod(models.TextChoices):
    PASSWORD = 'password', 'Пароль'
    SSO = 'sso', 'SSO'


class UserSession(models.Model):
    """A signed-in browser: shown in the profile so the user can see and end their sessions.

    The Django session itself stays the source of truth; this row only describes it.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='panel_sessions')
    session_key = models.CharField('ключ сессии', max_length=40, unique=True)
    method = models.CharField('способ входа', max_length=16, choices=LoginMethod.choices)
    user_agent = models.TextField('браузер', blank=True)
    ip = models.GenericIPAddressField('IP', null=True, blank=True)
    created_at = models.DateTimeField('вход', auto_now_add=True)
    last_seen_at = models.DateTimeField('последняя активность', auto_now_add=True)

    class Meta:
        verbose_name = 'сессия'
        verbose_name_plural = 'сессии'
        ordering = ['-last_seen_at']

    def __str__(self):
        return f'{self.user} · {self.created_at:%d.%m.%Y %H:%M}'
