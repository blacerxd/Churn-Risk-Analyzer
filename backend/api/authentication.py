import hmac

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from drf_spectacular.authentication import SessionScheme
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.authentication import BaseAuthentication, SessionAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission


class SessionAuth(SessionAuthentication):
    # Without WWW-Authenticate DRF turns 401 into 403; the frontend relies on 401.
    def authenticate_header(self, request):
        return 'Session'


class SessionAuthScheme(SessionScheme):
    target_class = SessionAuth


class MetricsTokenAuth(BaseAuthentication):
    """Authorization: Bearer <METRICS_TOKEN> for the Prometheus scraper, no user behind it."""

    def authenticate(self, request):
        header = request.META.get('HTTP_AUTHORIZATION', '')
        scheme, _, token = header.partition(' ')
        if scheme.lower() != 'bearer' or not token:
            return None
        expected = settings.METRICS_TOKEN
        # An empty METRICS_TOKEN disables the endpoint instead of accepting any token
        if not expected or not hmac.compare_digest(token.strip().encode(), expected.encode()):
            raise AuthenticationFailed('Неверный токен', code='invalid_token')
        return AnonymousUser(), token

    def authenticate_header(self, request):
        return 'Bearer'


class HasMetricsToken(BasePermission):
    def has_permission(self, request, view):
        return request.auth is not None


class MetricsTokenScheme(OpenApiAuthenticationExtension):
    target_class = MetricsTokenAuth
    name = 'metricsToken'

    def get_security_definition(self, auto_schema):
        return {'type': 'http', 'scheme': 'bearer', 'description': 'Значение METRICS_TOKEN из .env'}
