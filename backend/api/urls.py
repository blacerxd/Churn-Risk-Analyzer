from django.urls import path

from api.views.auth import CsrfView, LoginView, LogoutView, MeView
from api.views.events import events
from api.views.snapshot import SnapshotView

app_name = 'api'

urlpatterns = [
    path('auth/csrf', CsrfView.as_view(), name='auth-csrf'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/me', MeView.as_view(), name='auth-me'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('events', events, name='events'),
    path('source/snapshot', SnapshotView.as_view(), name='source-snapshot'),
]
