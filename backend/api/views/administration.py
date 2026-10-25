from django.contrib.auth import get_user_model
from django.db.models import Q
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from analytics.models import AnalyticsSnapshot
from api.pagination import PagePagination
from api.serializers import (
    AdminUserQuerySerializer,
    AdminUserSerializer,
    RecalculationSerializer,
    StatusEventQuerySerializer,
    StatusEventSerializer,
)
from customers.models import ServiceStatusEvent

PAGE_PARAMS = [OpenApiParameter('page', int), OpenApiParameter('page_size', int, description='До 100, по умолчанию 25')]


class StaffOnly:
    # Administration section of the panel: only for users with is_staff
    permission_classes = [IsAdminUser]
    pagination_class = PagePagination


@extend_schema_view(
    get=extend_schema(tags=['administration'], summary='Пользователи панели', parameters=[AdminUserQuerySerializer, *PAGE_PARAMS]),
    post=extend_schema(tags=['administration'], summary='Создать пользователя'),
)
class AdminUserListView(StaffOnly, generics.ListCreateAPIView):
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        query = AdminUserQuerySerializer(data=self.request.query_params)
        query.is_valid(raise_exception=True)
        users = get_user_model().objects.order_by('username')
        if search := query.validated_data.get('search'):
            users = users.filter(Q(username__icontains=search) | Q(email__icontains=search))
        return users


@extend_schema_view(
    get=extend_schema(tags=['administration'], summary='Пользователь'),
    patch=extend_schema(
        tags=['administration'],
        summary='Изменить пользователя',
        description='Блокировка (is_active), права администратора (is_staff, только суперпользователь), новый пароль.',
    ),
)
class AdminUserDetailView(StaffOnly, generics.RetrieveUpdateAPIView):
    serializer_class = AdminUserSerializer
    queryset = get_user_model().objects.all()
    http_method_names = ['get', 'patch']


@extend_schema(tags=['administration'], summary='История пересчётов', parameters=PAGE_PARAMS)
class RecalculationListView(StaffOnly, generics.ListAPIView):
    serializer_class = RecalculationSerializer
    queryset = AnalyticsSnapshot.objects.order_by('-calculated_at', '-id')


@extend_schema(
    tags=['administration'],
    summary='Журнал смен статусов услуг',
    description='Копится из разницы между загруженными снимками.',
    parameters=[StatusEventQuerySerializer, *PAGE_PARAMS],
)
class StatusEventListView(StaffOnly, generics.ListAPIView):
    serializer_class = StatusEventSerializer

    def get_queryset(self):
        query = StatusEventQuerySerializer(data=self.request.query_params)
        query.is_valid(raise_exception=True)
        return ServiceStatusEvent.objects.filter(**query.validated_data).order_by('-detected_at', '-id')
