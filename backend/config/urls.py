from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from api.views.health import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health', health),
    path('api/v1/schema', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs', SpectacularSwaggerView.as_view(url_name='schema'), name='docs'),
    path('api/v1/', include('api.urls')),
]
