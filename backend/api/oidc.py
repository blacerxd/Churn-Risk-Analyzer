from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.http import Http404
from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from mozilla_django_oidc.views import OIDCAuthenticationCallbackView, OIDCAuthenticationRequestView


class OIDCBackend(OIDCAuthenticationBackend):
    """Provider users are stored with their email as username.

    Local staff accounts are never taken over through SSO, even with a matching email.
    """

    def verify_claims(self, claims):
        return bool(claims.get('email')) and claims.get('email_verified') is True

    def filter_users_by_claims(self, claims):
        return self.UserModel.objects.filter(username__iexact=claims['email'])

    def create_user(self, claims):
        return self.UserModel.objects.create_user(claims['email'], email=claims['email'])

    def update_user(self, user, claims):
        if user.is_staff or user.is_superuser:
            raise SuspiciousOperation('SSO login into a staff account')
        return user


# The library views read their settings in __init__, so check the flag before building them
def oidc_login(request):
    if not settings.OIDC_ENABLED:
        raise Http404
    return OIDCAuthenticationRequestView.as_view()(request)


def oidc_callback(request):
    if not settings.OIDC_ENABLED:
        raise Http404
    return OIDCAuthenticationCallbackView.as_view()(request)
