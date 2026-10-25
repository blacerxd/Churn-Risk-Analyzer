from django.urls import path

from api.views.administration import AdminUserDetailView, AdminUserListView, RecalculationListView, StatusEventListView
from api.views.analytics import ChurnChartView, SummaryView
from api.views.auth import AuthConfigView, CsrfView, LoginView, LogoutView, MeView
from api.views.customers import CustomerDetailView, CustomerListView
from api.views.events import events
from api.views.model_settings import ModelSettingsView
from api.views.passkeys import PasskeyDetailView, PasskeySetupView, PasskeysView
from api.views.snapshot import SnapshotView

app_name = 'api'

urlpatterns = [
    path('auth/config', AuthConfigView.as_view(), name='auth-config'),
    path('auth/csrf', CsrfView.as_view(), name='auth-csrf'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/me', MeView.as_view(), name='auth-me'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('auth/passkeys', PasskeysView.as_view(), name='auth-passkeys'),
    path('auth/passkeys/setup', PasskeySetupView.as_view(), name='auth-passkeys-setup'),
    path('auth/passkeys/<str:credential_id>', PasskeyDetailView.as_view(), name='auth-passkey'),
    path('customers', CustomerListView.as_view(), name='customer-list'),
    path('customers/<int:pk>', CustomerDetailView.as_view(), name='customer-detail'),
    path('analytics/summary', SummaryView.as_view(), name='analytics-summary'),
    path('analytics/churn-chart', ChurnChartView.as_view(), name='analytics-churn-chart'),
    path('model/settings', ModelSettingsView.as_view(), name='model-settings'),
    path('events', events, name='events'),
    path('admin/users', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>', AdminUserDetailView.as_view(), name='admin-user'),
    path('admin/recalculations', RecalculationListView.as_view(), name='admin-recalculations'),
    path('admin/status-events', StatusEventListView.as_view(), name='admin-status-events'),
    path('source/snapshot', SnapshotView.as_view(), name='source-snapshot'),
]
