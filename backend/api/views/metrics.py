from django.http import HttpResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema
from prometheus_client import CONTENT_TYPE_LATEST, CollectorRegistry, generate_latest
from prometheus_client.core import GaugeMetricFamily
from rest_framework.views import APIView

from analytics.models import AnalyticsSnapshot
from analytics.recalculation import current_summary
from api.authentication import HasMetricsToken, MetricsTokenAuth
from customers.models import Customer, Service, Transaction


class PortfolioCollector:
    """Values come from the same latest AnalyticsSnapshot as /analytics/summary."""

    def collect(self):
        summary = current_summary()
        latest = AnalyticsSnapshot.objects.order_by('-calculated_at', '-id').first()

        customers = GaugeMetricFamily('churn_customers', 'Клиентов по уровню риска', labels=['level'])
        for level, count in summary['by_level'].items():
            customers.add_metric([level], count)
        yield customers

        yield GaugeMetricFamily(
            'churn_expected_loss_cents', 'Ожидаемая потеря, единицы баланса (100 = 1 EUR)',
            value=summary['expected_loss_cents'],
        )
        yield GaugeMetricFamily(
            'churn_revenue_at_risk_cents', 'Выручка под риском, единицы баланса (100 = 1 EUR)',
            value=summary['revenue_at_risk_cents'],
        )
        yield GaugeMetricFamily('churn_services_at_risk', 'Услуг под риском', value=summary['services_at_risk'])

        if latest is not None:
            if latest.score_avg is not None:
                yield GaugeMetricFamily('churn_score_avg', 'Средний score оценённых клиентов', value=latest.score_avg)
            yield GaugeMetricFamily(
                'churn_last_recalculation_timestamp', 'Время последнего пересчёта, unix time',
                value=latest.calculated_at.timestamp(),
            )
            yield GaugeMetricFamily(
                'churn_last_recalculation_duration_seconds', 'Длительность последнего пересчёта',
                value=latest.duration_seconds,
            )

        rows = GaugeMetricFamily('churn_source_rows', 'Строк в загруженном снимке', labels=['kind'])
        rows.add_metric(['accounts'], Customer.objects.count())
        rows.add_metric(['services'], Service.objects.count())
        rows.add_metric(['transactions'], Transaction.objects.count())
        yield rows


class MetricsView(APIView):
    authentication_classes = [MetricsTokenAuth]
    permission_classes = [HasMetricsToken]

    @extend_schema(
        tags=['metrics'],
        summary='Метрики для Prometheus',
        description='Формат Prometheus text. Значения совпадают с `/api/v1/analytics/summary`.',
        responses={
            (200, 'text/plain'): OpenApiResponse(OpenApiTypes.STR),
            401: OpenApiResponse(description='Нет токена или токен неверный'),
        },
    )
    def get(self, request):
        registry = CollectorRegistry(auto_describe=True)
        registry.register(PortfolioCollector())
        return HttpResponse(generate_latest(registry), content_type=CONTENT_TYPE_LATEST)
