from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.authentication import SessionAuth
from api.serializers import AuthConfigSerializer, LoginSerializer, UserSerializer


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['auth'],
        summary='Получить CSRF-cookie',
        description='Выставляет cookie `csrftoken`. Значение передаётся в заголовке `X-CSRFToken` во всех POST/PUT/PATCH.',
        responses={204: None},
    )
    def get(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)


class AuthConfigView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(tags=['auth'], summary='Доступные способы входа', responses=AuthConfigSerializer)
    def get(self, request):
        return Response({'oidc_enabled': settings.OIDC_ENABLED})


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_scope = 'login'

    @extend_schema(
        tags=['auth'],
        summary='Вход по логину и паролю',
        request=LoginSerializer,
        responses={
            200: UserSerializer,
            400: OpenApiResponse(description='Не указан логин или пароль'),
            401: OpenApiResponse(description='Неверный логин или пароль'),
            429: OpenApiResponse(description='Слишком много попыток'),
        },
    )
    def post(self, request):
        SessionAuth().enforce_csrf(request)

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(request, **serializer.validated_data)
        if user is None:
            raise AuthenticationFailed('Неверный логин или пароль', code='invalid_credentials')

        login(request, user)
        return Response(UserSerializer(user).data)

    def get_authenticate_header(self, request):
        return 'Session'


class MeView(APIView):
    @extend_schema(
        tags=['auth'],
        summary='Текущий пользователь',
        responses={200: UserSerializer, 401: OpenApiResponse(description='Не выполнен вход')},
    )
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    @extend_schema(
        tags=['auth'],
        summary='Завершение сессии',
        request=None,
        responses={204: None, 401: OpenApiResponse(description='Не выполнен вход')},
    )
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
