from rest_framework.exceptions import ValidationError
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, ValidationError):
        response.data = {
            'detail': 'Некорректные данные',
            'code': 'invalid',
            'errors': response.data,
        }
        return response

    # Django's Http404 and PermissionDenied are converted by DRF, so take detail from the response.
    detail = response.data.get('detail', '') if isinstance(response.data, dict) else ''
    response.data = {
        'detail': str(detail),
        'code': getattr(detail, 'code', None) or 'error',
    }
    return response
