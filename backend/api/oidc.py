from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.http import Http404
from mozilla_django_oidc.auth import OIDCAuthenticationBackend
from mozilla_django_oidc.views import OIDCAuthenticationCallbackView, OIDCAuthenticationRequestView


class OIDCBackend(OIDCAuthenticationBackend):
    """SSO signs in only users created in the admin section, matched by email.

    The first sign-in is always with the panel password: until the user has logged in once
    (last_login is empty), SSO is refused. Blocked users are refused by the callback view.
    """

    def verify_claims(self, claims):
        return bool(claims.get('email')) and claims.get('email_verified') is True

    def filter_users_by_claims(self, claims):
        return self.UserModel.objects.filter(email__iexact=claims['email'])

    def update_user(self, user, claims):
        if user.last_login is None:
            raise SuspiciousOperation('first sign-in must be with the panel password')
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
