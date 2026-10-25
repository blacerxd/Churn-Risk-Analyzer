from django.apps import AppConfig


class AnalyticsConfig(AppConfig):
    name = 'analytics'
    verbose_name = 'Аналитика'

    def ready(self):
        # Импорт пакета регистрирует все признаки в реестре.
        from . import features  # noqa: F401
        # Подписка пересчёта на загрузку снимка и сохранение настроек.
        from . import receivers  # noqa: F401
