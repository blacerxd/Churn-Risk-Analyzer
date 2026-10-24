from django.urls import path

from api.views.auth import CsrfView, LoginView, LogoutView, MeView

app_name = 'api'

urlpatterns = [
    path('auth/csrf', CsrfView.as_view(), name='auth-csrf'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/me', MeView.as_view(), name='auth-me'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
]
