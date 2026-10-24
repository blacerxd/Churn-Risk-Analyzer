from drf_spectacular.authentication import SessionScheme
from rest_framework.authentication import SessionAuthentication


class SessionAuth(SessionAuthentication):
    # Without WWW-Authenticate DRF turns 401 into 403; the frontend relies on 401.
    def authenticate_header(self, request):
        return 'Session'


class SessionAuthScheme(SessionScheme):
    target_class = SessionAuth
