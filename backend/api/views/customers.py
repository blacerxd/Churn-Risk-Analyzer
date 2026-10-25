from datetime import timedelta

from django.db.models import BigIntegerField, CharField, F, TextField, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from analytics.money import monthly_equivalent
from analytics.scoring import NO_DATA_REASON, RiskLevel
from api.pagination import PagePagination
from api.serializers import (
    CustomerDetailSerializer,
    CustomerListQuerySerializer,
    CustomerPageSerializer,
    CustomerRowSerializer,
)
from customers.models import Customer, Service


def with_risk(queryset):
    # Before the first recalculation customers have no RiskAssessment yet.
    return queryset.annotate(
        score=F('risk__score'),
        level=Coalesce('risk__level', Value(RiskLevel.NONE.value, output_field=CharField())),
        top_reason=Coalesce('risk__top_reason', Value(NO_DATA_REASON, output_field=TextField())),
        expected_loss=Coalesce('risk__expected_loss', Value(0, output_field=BigIntegerField())),
    )


def whole_days(delta):
    # Same rounding as in factor explanations: toward zero.
    days = abs(delta) // timedelta(days=1)
    return days if delta >= timedelta(0) else -days


class CustomerListView(APIView):
    pagination_class = PagePagination

    @extend_schema(
        tags=['customers'],
        operation_id='customers_list',
        summary='Список клиентов с оценкой риска',
        parameters=[
            CustomerListQuerySerializer,
            OpenApiParameter('page', OpenApiTypes.INT),
            OpenApiParameter('page_size', OpenApiTypes.INT, description='До 100, по умолчанию 25'),
        ],
        responses=CustomerPageSerializer,
    )
    def get(self, request):
        query = CustomerListQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        params = query.validated_data

        customers = with_risk(Customer.objects.all())
        if level := params.get('level'):
            customers = customers.filter(level=level)
        if search := params.get('search'):
            customers = customers.filter(email__icontains=search)
        customers = customers.order_by(*self._ordering(params['ordering']))

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(customers, request, view=self)
        return paginator.get_paginated_response(CustomerRowSerializer(page, many=True).data)

    @staticmethod
    def _ordering(value):
        field = value.lstrip('-')
        expression = F(field)
        if value.startswith('-'):
            expression = expression.desc(nulls_last=True)
        else:
            expression = expression.asc(nulls_last=True)
        return [expression, 'id'] if field != 'id' else [expression]


class CustomerDetailView(APIView):
    @extend_schema(
        tags=['customers'],
        summary='Карточка клиента: признаки риска и услуги',
        responses=CustomerDetailSerializer,
    )
    def get(self, request, pk):
        customer = with_risk(Customer.objects.select_related('risk')).filter(pk=pk).first()
        if customer is None:
            raise NotFound('Клиент не найден')
        risk = getattr(customer, 'risk', None)
        customer.calculated_at = risk.calculated_at if risk else None
        customer.factor_rows = risk.factors if risk else []
        customer.service_rows = self._services(customer, risk)
        return Response(CustomerDetailSerializer(customer).data)

    @staticmethod
    def _services(customer, risk):
        now = risk.calculated_at if risk else timezone.now()
        losses = {item['service_id']: item['expected_loss'] for item in (risk.services if risk else [])}
        return [
            {
                'id': service.id,
                'name': service.name,
                'status': service.status,
                'price_cents': service.price,
                'payment_term': service.payment_term,
                'autoprolong': service.auto_prolong,
                'expires_at': service.expires_at,
                'days_to_expiry': whole_days(service.expires_at - now),
                'monthly_equivalent_cents': monthly_equivalent(service.price, service.payment_term),
                'expected_loss_cents': losses.get(service.id, 0),
            }
            for service in Service.objects.filter(customer=customer).order_by('expires_at', 'id')
        ]
