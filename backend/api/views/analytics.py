from collections import defaultdict
from datetime import UTC, timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.context import SCORED_STATUSES
from analytics.models import AnalyticsSnapshot, RiskAssessment
from analytics.recalculation import current_summary
from api.serializers import ChurnChartQuerySerializer, ChurnChartSerializer, SummarySerializer
from customers.models import Service, ServiceStatus, ServiceStatusEvent


class SummaryView(APIView):
    @extend_schema(tags=['analytics'], summary='Итоги по портфелю клиентов', responses=SummarySerializer)
    def get(self, request):
        return Response(current_summary())


class ChurnChartView(APIView):
    @extend_schema(
        tags=['analytics'],
        summary='График оттока: факт и прогноз',
        description=(
            'Факт: сколько услуг перешло в deleted за день. История копится из разницы между '
            'загруженными снимками, поэтому начинается с первого обнаруженного удаления. '
            'Прогноз: по услугам, которые истекают в ближайшие `days` дней, сумма вероятностей '
            'ухода их владельцев. Отсчёт идёт от времени последнего пересчёта.'
        ),
        parameters=[ChurnChartQuerySerializer],
        responses=ChurnChartSerializer,
    )
    def get(self, request):
        query = ChurnChartQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        days = query.validated_data['days']

        latest = AnalyticsSnapshot.objects.order_by('-calculated_at', '-id').first()
        now = latest.calculated_at if latest else timezone.now()
        at_risk = latest.services_at_risk if latest else 0
        return Response({'series': self._facts(now, days) + self._forecast(now, days, at_risk)})

    @staticmethod
    def _facts(now, days):
        today = now.astimezone(UTC).date()
        start = today - timedelta(days=days - 1)
        deleted = dict(
            ServiceStatusEvent.objects
            .filter(new_status=ServiceStatus.DELETED, detected_at__lte=now)
            .annotate(day=TruncDate('detected_at', tzinfo=UTC))
            .filter(day__gte=start)
            .values('day')
            .annotate(count=Count('id'))
            .values_list('day', 'count')
        )
        first_event = ServiceStatusEvent.objects.order_by('detected_at').values_list('detected_at', flat=True).first()
        if first_event is None:
            return []

        # services_at_risk at the end of each day, from the recalculation history
        history = list(
            AnalyticsSnapshot.objects
            .filter(calculated_at__lte=now)
            .order_by('calculated_at', 'id')
            .values_list('calculated_at', 'services_at_risk')
        )
        points, index, current = [], 0, 0
        day = max(start, first_event.astimezone(UTC).date())
        while day <= today:
            while index < len(history) and history[index][0].astimezone(UTC).date() <= day:
                current = history[index][1]
                index += 1
            points.append({
                'date': day, 'kind': 'fact',
                'deleted_services': deleted.get(day, 0), 'services_at_risk': current,
            })
            day += timedelta(days=1)
        return points

    @staticmethod
    def _forecast(now, days, at_risk):
        probability = dict(
            RiskAssessment.objects.filter(probability__isnull=False)
            .values_list('customer_id', 'probability')
        )
        expected = defaultdict(float)
        services = Service.objects.filter(
            status__in=SCORED_STATUSES, expires_at__gt=now, expires_at__lte=now + timedelta(days=days),
        ).values_list('customer_id', 'expires_at')
        for customer_id, expires_at in services:
            expected[expires_at.astimezone(UTC).date()] += probability.get(customer_id, 0.0)

        today = now.astimezone(UTC).date()
        return [
            {
                'date': today + timedelta(days=offset), 'kind': 'forecast',
                'expected_non_renewals': round(expected.get(today + timedelta(days=offset), 0.0), 2),
                'services_at_risk': at_risk,
            }
            for offset in range(1, days + 1)
        ]
