from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from api.oidc import oidc_callback, oidc_login
from api.views.health import health
from api.views.metrics import MetricsView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health', health),
    path('metrics', MetricsView.as_view(), name='metrics'),
    path('api/v1/schema', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/v1/auth/oidc/login', oidc_login, name='oidc-login'),
    path('api/v1/auth/oidc/callback', oidc_callback, name='oidc-callback'),
    path('api/v1/', include('api.urls')),
]
