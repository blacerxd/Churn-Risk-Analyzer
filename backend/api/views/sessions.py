from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from api import keycloak
from api.serializers import EndedSessionsSerializer, UserSessionSerializer
from api.sessions import active_sessions, describe_agent, end_session


def end_keycloak_sessions(username):
    # the next «Войти через SSO» must ask for the passkey again; Keycloak being down must not block this
    if keycloak.enabled():
        try:
            keycloak.logout_user(username)
        except keycloak.KeycloakError:
            pass


def as_data(row, current_key):
    return {
        'id': row.pk, 'device': describe_agent(row.user_agent), 'ip': row.ip, 'method': row.method,
        'created_at': row.created_at, 'last_seen_at': row.last_seen_at, 'current': row.session_key == current_key,
    }


class SessionListView(APIView):
    @extend_schema(tags=['auth'], summary='Мои активные сессии', responses=UserSessionSerializer(many=True))
    def get(self, request):
        key = request.session.session_key
        rows = sorted(active_sessions(request.user), key=lambda row: (row.session_key != key, -row.last_seen_at.timestamp()))
        return Response(UserSessionSerializer([as_data(row, key) for row in rows], many=True).data)


class SessionDetailView(APIView):
    @extend_schema(
        tags=['auth'],
        summary='Завершить сессию',
        description='Завершает свою сессию на другом устройстве. Текущую завершает выход (`auth/logout`).',
        responses={204: None, 400: OpenApiResponse(description='Это текущая сессия'), 404: OpenApiResponse(description='Нет такой сессии')},
    )
    def delete(self, request, pk):
        row = next((row for row in active_sessions(request.user) if row.pk == pk), None)
        if row is None:
            return Response({'detail': 'Сессия не найдена', 'code': 'not_found'}, status=status.HTTP_404_NOT_FOUND)
        if row.session_key == request.session.session_key:
            return Response({'detail': 'Текущую сессию завершает кнопка «Выйти»', 'code': 'current_session'}, status=status.HTTP_400_BAD_REQUEST)
        end_session(row)
        return Response(status=status.HTTP_204_NO_CONTENT)


class EndOtherSessionsView(APIView):
    @extend_schema(
        tags=['auth'],
        summary='Завершить все сессии, кроме текущей',
        description='Заодно завершает сессии в Keycloak, чтобы с тех устройств нельзя было вернуться через SSO без ключа.',
        request=None,
        responses=EndedSessionsSerializer,
    )
    def post(self, request):
        others = [row for row in active_sessions(request.user) if row.session_key != request.session.session_key]
        for row in others:
            end_session(row)
        end_keycloak_sessions(request.user.username)
        return Response({'ended': len(others)})


class AdminUserSessionsView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=['administration'], summary='Сессии пользователя', responses=UserSessionSerializer(many=True))
    def get(self, request, pk):
        user = get_object_or_404(get_user_model(), pk=pk)
        key = request.session.session_key
        return Response(UserSessionSerializer([as_data(row, key) for row in active_sessions(user)], many=True).data)

    @extend_schema(
        tags=['administration'],
        summary='Завершить все сессии пользователя',
        description='Пользователь выходит на всех устройствах, в том числе из Keycloak. Свои сессии так не завершить.',
        responses={200: EndedSessionsSerializer, 400: OpenApiResponse(description='Свою учётную запись — через профиль')},
    )
    def delete(self, request, pk):
        user = get_object_or_404(get_user_model(), pk=pk)
        if user == request.user:
            return Response({'detail': 'Свои сессии завершайте в профиле', 'code': 'own_account'}, status=status.HTTP_400_BAD_REQUEST)
        if user.is_superuser and not request.user.is_superuser:
            return Response({'detail': 'Сессии суперпользователя может завершить только суперпользователь', 'code': 'permission_denied'}, status=status.HTTP_403_FORBIDDEN)
        rows = active_sessions(user)
        for row in rows:
            end_session(row)
        end_keycloak_sessions(user.username)
        return Response({'ended': len(rows)})
