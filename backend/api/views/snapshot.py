import json

from django.conf import settings
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.exceptions import ParseError
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import (
    SnapshotErrorSerializer,
    SnapshotResultSerializer,
    SnapshotUploadSerializer,
)
from customers.importer import SnapshotValidationError, replace_snapshot


def error_response(detail, code, status_code, **extra):
    return Response({'detail': detail, 'code': code, **extra}, status=status_code)


class SnapshotView(APIView):
    parser_classes = [JSONParser, MultiPartParser]

    @extend_schema(
        tags=['source'],
        summary='Загрузить снимок исходных данных',
        description=(
            'Полностью заменяет аккаунты, услуги и транзакции и запускает пересчёт оценок. '
            'Формат снимка описан в docs/api-contract.md. Принимает JSON в теле запроса '
            'или JSON-файл в поле `file` (multipart/form-data). При ошибке данные не меняются.'
        ),
        request={
            'application/json': OpenApiTypes.OBJECT,
            'multipart/form-data': SnapshotUploadSerializer,
        },
        responses={
            200: SnapshotResultSerializer,
            400: OpenApiResponse(SnapshotErrorSerializer, description='Снимок не прошёл проверку'),
            413: OpenApiResponse(SnapshotErrorSerializer, description='Слишком большой снимок'),
        },
    )
    def put(self, request):
        too_large = self._check_size(request)
        if too_large:
            return too_large

        payload = self._read_payload(request)
        try:
            result = replace_snapshot(payload)
        except SnapshotValidationError as exc:
            return error_response(
                str(exc), 'invalid_snapshot', status.HTTP_400_BAD_REQUEST,
                errors=[{'path': e.path, 'message': e.message} for e in exc.errors],
                errors_total=exc.total,
            )

        data = {
            'accounts': result.accounts,
            'services': result.services,
            'transactions': result.transactions,
            'status_changes': result.status_changes,
            'imported_at': result.imported_at,
            'recalculated_at': None,
        }
        return Response(SnapshotResultSerializer(data).data)

    @staticmethod
    def _check_size(request):
        limit = settings.SNAPSHOT_MAX_BYTES
        try:
            length = int(request.META.get('CONTENT_LENGTH') or 0)
        except ValueError:
            length = 0
        if length > limit:
            return error_response(
                f'Снимок больше {limit // (1024 * 1024)} МБ', 'too_large',
                status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )
        return None

    @staticmethod
    def _read_payload(request):
        if request.content_type.startswith('multipart/'):
            upload = request.FILES.get('file')
            if upload is None:
                raise ParseError('Не передан файл в поле file')
            try:
                return json.loads(upload.read())
            except (UnicodeDecodeError, json.JSONDecodeError):
                raise ParseError('Файл не является корректным JSON') from None
        return request.data
