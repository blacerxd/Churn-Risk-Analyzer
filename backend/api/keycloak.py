"""Panel users mirrored into Keycloak, so a user created in the admin section can later sign in with SSO.

The panel is the source of truth: Keycloak gets the same username, email and password and
on the first SSO login asks to register a passkey. Calls go through the service account of
the churn-provisioner client (realm-management: manage-users).
"""

import requests
from django.conf import settings

TIMEOUT = 10
REGISTER_PASSKEY = 'webauthn-register-passwordless'


class KeycloakError(Exception):
    pass


def enabled() -> bool:
    return settings.OIDC_ENABLED and bool(settings.KEYCLOAK_PROVISIONER_SECRET)


def _token() -> str:
    response = requests.post(
        f'{settings.KEYCLOAK_REALM_URL}/protocol/openid-connect/token',
        data={
            'grant_type': 'client_credentials',
            'client_id': settings.KEYCLOAK_PROVISIONER_CLIENT_ID,
            'client_secret': settings.KEYCLOAK_PROVISIONER_SECRET,
        },
        timeout=TIMEOUT,
    )
    if response.status_code != 200:
        raise KeycloakError(f'нет доступа к Keycloak ({response.status_code})')
    return response.json()['access_token']


def _call(method: str, path: str, **kwargs) -> requests.Response:
    try:
        response = requests.request(
            method, f'{settings.KEYCLOAK_ADMIN_URL}{path}',
            headers={'Authorization': f'Bearer {_token()}'}, timeout=TIMEOUT, **kwargs,
        )
    except requests.RequestException as exc:
        raise KeycloakError('Keycloak недоступен') from exc
    if response.status_code == 409:
        raise KeycloakError('в SSO уже есть пользователь с таким логином или email')
    if response.status_code >= 400:
        raise KeycloakError(f'Keycloak ответил {response.status_code}')
    return response


def _find(username: str) -> str | None:
    users = _call('GET', '/users', params={'username': username, 'exact': 'true'}).json()
    return users[0]['id'] if users else None


def _profile(user) -> dict:
    return {
        'username': user.username,
        'email': user.email,
        'emailVerified': True,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'enabled': user.is_active,
    }


def create_user(user, password: str) -> None:
    _call('POST', '/users', json={
        **_profile(user),
        'credentials': [{'type': 'password', 'value': password, 'temporary': False}],
        'requiredActions': [REGISTER_PASSKEY],
    })


def update_user(user, password: str | None = None, username: str | None = None) -> None:
    """Profile and blocking follow the panel; a new password replaces the Keycloak one.

    username is the login before the change, when the admin renamed the user.
    """
    user_id = _find(username or user.username)
    if user_id is None:
        # created before SSO was switched on: make it now if the password is known
        if password:
            create_user(user, password)
        return
    _call('PUT', f'/users/{user_id}', json=_profile(user))
    if password:
        _call('PUT', f'/users/{user_id}/reset-password', json={
            'type': 'password', 'value': password, 'temporary': False,
        })


PASSKEY_TYPE = 'webauthn-passwordless'


def user_id(username: str) -> str | None:
    return _find(username)


def list_passkeys(kc_user_id: str) -> list[dict]:
    credentials = _call('GET', f'/users/{kc_user_id}/credentials').json()
    return [
        {'id': item['id'], 'label': item.get('userLabel') or '', 'created': item.get('createdDate')}
        for item in credentials if item.get('type') == PASSKEY_TYPE
    ]


def delete_passkey(kc_user_id: str, credential_id: str) -> bool:
    """Removes only the user's own passkeys, never the password."""
    if credential_id not in {item['id'] for item in list_passkeys(kc_user_id)}:
        return False
    _call('DELETE', f'/users/{kc_user_id}/credentials/{credential_id}')
    return True


def logout_user(username: str) -> None:
    """Ends the user's Keycloak sessions, so the next SSO sign-in asks for the passkey again."""
    kc_user_id = _find(username)
    if kc_user_id:
        _call('POST', f'/users/{kc_user_id}/logout')
