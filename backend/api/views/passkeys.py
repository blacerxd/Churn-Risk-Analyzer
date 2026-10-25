from datetime import UTC, datetime

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from api import keycloak
from api.serializers import PasskeySetupResultSerializer, PasskeySetupSerializer, PasskeysSerializer

REGISTER_URL = '/api/v1/auth/oidc/passkey?next=/profile%3Fpasskey%3Dadded'


def error(detail, code, status_code):
    return Response({'detail': detail, 'code': code}, status=status_code)


def sso_unavailable():
    return error('Вход по ключу выключен на этом сервере', 'sso_disabled', status.HTTP_404_NOT_FOUND)


def keycloak_failed(exc):
    return error(f'SSO недоступен: {exc}', 'sso_unavailable', status.HTTP_503_SERVICE_UNAVAILABLE)


class PasskeysView(APIView):
    @extend_schema(
        tags=['auth'],
        summary='Мои ключи доступа (passkey)',
        description='Есть ли у текущего пользователя учётная запись SSO и какие ключи для входа через SSO он добавил.',
        responses={200: PasskeysSerializer},
    )
    def get(self, request):
        if not keycloak.enabled():
            return Response({'sso_enabled': False, 'sso_account': False, 'passkeys': []})
        try:
            kc_id = keycloak.user_id(request.user.username)
            passkeys = keycloak.list_passkeys(kc_id) if kc_id else []
        except keycloak.KeycloakError as exc:
            return keycloak_failed(exc)
        for item in passkeys:
            created = item.pop('created')
            item['created_at'] = datetime.fromtimestamp(created / 1000, UTC) if created else None
        return Response(PasskeysSerializer({'sso_enabled': True, 'sso_account': kc_id is not None, 'passkeys': passkeys}).data)


class PasskeySetupView(APIView):
    @extend_schema(
        tags=['auth'],
        summary='Начать добавление ключа доступа',
        description=(
            'Возвращает адрес, по которому браузер уходит в Keycloak: подтвердить вход и создать ключ, '
            'затем вернуться в профиль. Если учётной записи SSO ещё нет (пользователь создан до включения SSO), '
            'нужен пароль от панели: после проверки учётная запись создаётся.'
        ),
        request=PasskeySetupSerializer,
        responses={200: PasskeySetupResultSerializer, 400: OpenApiResponse(description='Нужен пароль или он неверный')},
    )
    def post(self, request):
        if not keycloak.enabled():
            return sso_unavailable()
        user = request.user
        try:
            if keycloak.user_id(user.username) is None:
                password = request.data.get('password') or ''
                if not password:
                    raise serializers.ValidationError({'password': ['Введите пароль от панели, чтобы включить вход по ключу']})
                if not user.check_password(password):
                    raise serializers.ValidationError({'password': ['Неверный пароль']})
                if not user.email:
                    raise serializers.ValidationError({'email': ['Попросите администратора указать ваш email']})
                keycloak.create_user(user, password)
        except keycloak.KeycloakError as exc:
            return keycloak_failed(exc)
        return Response({'url': REGISTER_URL})


class PasskeyDetailView(APIView):
    @extend_schema(tags=['auth'], summary='Удалить ключ доступа', responses={204: None, 404: OpenApiResponse(description='Нет такого ключа')})
    def delete(self, request, credential_id):
        if not keycloak.enabled():
            return sso_unavailable()
        try:
            kc_id = keycloak.user_id(request.user.username)
            removed = bool(kc_id) and keycloak.delete_passkey(kc_id, credential_id)
            if removed:
                # a session opened with the removed key must not keep working
                keycloak.logout_user(request.user.username)
        except keycloak.KeycloakError as exc:
            return keycloak_failed(exc)
        if not removed:
            return error('Ключ не найден', 'not_found', status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
