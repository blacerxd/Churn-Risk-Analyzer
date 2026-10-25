from django.conf import settings
from django.core.exceptions import SuspiciousOperation
from django.http import Http404
from django.shortcuts import redirect
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


class CallbackView(OIDCAuthenticationCallbackView):
    """After a passkey request Keycloak reports the result in kc_action_status (success, cancelled, error)."""

    @property
    def success_url(self):
        url = super().success_url
        action_status = self.request.GET.get('kc_action_status')
        if action_status and action_status != 'success' and 'passkey=added' in url:
            return url.replace('passkey=added', 'passkey=cancelled')
        return url


def oidc_callback(request):
    if not settings.OIDC_ENABLED:
        raise Http404
    return CallbackView.as_view()(request)


class PasskeyRegistrationView(OIDCAuthenticationRequestView):
    """Keycloak application-initiated action: confirm who you are, register a passkey, come back."""

    def get_extra_params(self, request):
        # prompt=login: a new key is added only after confirming who you are right now
        return {'kc_action': 'webauthn-register-passwordless', 'login_hint': request.user.username, 'prompt': 'login'}


def oidc_passkey(request):
    if not settings.OIDC_ENABLED:
        raise Http404
    if not request.user.is_authenticated:
        return redirect('/login?next=/profile')
    return PasskeyRegistrationView.as_view()(request)
