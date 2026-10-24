from django.apps import AppConfig


class AnalyticsConfig(AppConfig):
    name = 'analytics'

    def ready(self):
        # Импорт пакета регистрирует все признаки в реестре.
        from . import features  # noqa: F401
