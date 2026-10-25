from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.model_settings import SettingsValidationError, settings_payload, update_settings
from api.serializers import ModelSettingsPatchSerializer, ModelSettingsSerializer


def nested_errors(errors):
    # "weights.prolong_wait" -> {"weights": {"prolong_wait": [...]}}, same shape as DRF validation.
    # A message about a whole section ("weights") becomes a list: apply_patch checks sections
    # only when their fields are valid, so both kinds never meet in one section.
    result = {}
    for error in errors:
        section, _, key = error.path.partition('.')
        if not section:
            result.setdefault('non_field_errors', []).append(error.message)
        elif key:
            result.setdefault(section, {}).setdefault(key, []).append(error.message)
        else:
            result.setdefault(section, []).append(error.message)
    return result


class ModelSettingsView(APIView):
    @extend_schema(
        tags=['model'],
        summary='Действующие настройки модели и схема формы',
        responses=ModelSettingsSerializer,
    )
    def get(self, request):
        return Response(settings_payload())

    @extend_schema(
        tags=['model'],
        summary='Изменить настройки модели',
        description=(
            'Частичное изменение: передаются только меняемые поля. После сохранения в той же '
            'транзакции пересчитываются оценки всех клиентов, подписчики SSE получают событие '
            '`recalculated`. Ответ — уже действующие настройки.'
        ),
        request=ModelSettingsPatchSerializer,
        responses={
            200: ModelSettingsSerializer,
            400: OpenApiResponse(description='Ошибки по полям в `errors`, например errors.weights.prolong_wait'),
        },
    )
    def patch(self, request):
        try:
            update_settings(request.data)
        except SettingsValidationError as exc:
            return Response(
                {'detail': 'Некорректные данные', 'code': 'invalid', 'errors': nested_errors(exc.errors)},
                status=400,
            )
        return Response(settings_payload())
