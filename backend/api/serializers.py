from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from api import keycloak


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'is_staff', 'is_superuser']
        read_only_fields = fields


class SnapshotUploadSerializer(serializers.Serializer):
    file = serializers.FileField(help_text='JSON-файл снимка')


class SnapshotResultSerializer(serializers.Serializer):
    accounts = serializers.IntegerField()
    services = serializers.IntegerField()
    transactions = serializers.IntegerField()
    status_changes = serializers.IntegerField(help_text='Сколько услуг сменили статус по сравнению с прошлым снимком')
    imported_at = serializers.DateTimeField()
    recalculated_at = serializers.DateTimeField(allow_null=True)


class SnapshotErrorItemSerializer(serializers.Serializer):
    path = serializers.CharField(help_text='Путь к полю в исходном JSON, например services[3].ownerId')
    message = serializers.CharField()


class SnapshotErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()
    code = serializers.CharField()
    errors = SnapshotErrorItemSerializer(many=True, required=False)
    errors_total = serializers.IntegerField(required=False)


LEVEL_CHOICES = ['high', 'medium', 'low', 'none']
CUSTOMER_ORDERING = ['id', 'email', 'balance', 'total_replenished', 'score', 'level', 'expected_loss']


class CustomerListQuerySerializer(serializers.Serializer):
    level = serializers.ChoiceField(LEVEL_CHOICES, required=False)
    search = serializers.CharField(required=False, help_text='Часть email, без учёта регистра')
    ordering = serializers.ChoiceField(
        CUSTOMER_ORDERING + [f'-{field}' for field in CUSTOMER_ORDERING],
        required=False, default='-score',
    )


class CustomerRowSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.CharField()
    balance_cents = serializers.IntegerField(source='balance')
    total_replenished_cents = serializers.IntegerField(source='total_replenished')
    score = serializers.FloatField(allow_null=True)
    level = serializers.ChoiceField(LEVEL_CHOICES)
    top_reason = serializers.CharField()
    expected_loss_cents = serializers.IntegerField(source='expected_loss')


class CustomerPageSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    page = serializers.IntegerField()
    page_size = serializers.IntegerField()
    results = CustomerRowSerializer(many=True)


class FactorSerializer(serializers.Serializer):
    key = serializers.CharField()
    title = serializers.CharField()
    value = serializers.FloatField(help_text='Сила признака от 0 до 1')
    weight = serializers.FloatField()
    contribution = serializers.FloatField(help_text='Вклад в score')
    explanation = serializers.CharField()


class CustomerServiceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    status = serializers.CharField()
    price_cents = serializers.IntegerField()
    payment_term = serializers.CharField()
    autoprolong = serializers.BooleanField()
    expires_at = serializers.DateTimeField()
    days_to_expiry = serializers.IntegerField(
        allow_null=True, help_text='Целых суток до окончания оплаты, отрицательное — уже истекла',
    )
    monthly_equivalent_cents = serializers.IntegerField()
    expected_loss_cents = serializers.IntegerField()


class CustomerDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.CharField()
    balance_cents = serializers.IntegerField(source='balance')
    bonus_balance_cents = serializers.IntegerField(source='bonus_balance')
    bonus_usable = serializers.BooleanField()
    withdraw_balance_cents = serializers.IntegerField(source='withdraw_balance')
    total_replenished_cents = serializers.IntegerField(source='total_replenished')
    score = serializers.FloatField(allow_null=True)
    level = serializers.ChoiceField(LEVEL_CHOICES)
    top_reason = serializers.CharField()
    expected_loss_cents = serializers.IntegerField(source='expected_loss')
    calculated_at = serializers.DateTimeField(allow_null=True, help_text='Когда посчитана оценка')
    factors = FactorSerializer(many=True, source='factor_rows')
    services = CustomerServiceSerializer(many=True, source='service_rows')


class AuthConfigSerializer(serializers.Serializer):
    oidc_enabled = serializers.BooleanField(help_text='Показывать ли кнопку «Войти через SSO»')


class LevelCountsSerializer(serializers.Serializer):
    high = serializers.IntegerField()
    medium = serializers.IntegerField()
    low = serializers.IntegerField()
    none = serializers.IntegerField()


class SummarySerializer(serializers.Serializer):
    calculated_at = serializers.DateTimeField(allow_null=True, help_text='null до первого пересчёта')
    customers_total = serializers.IntegerField()
    by_level = LevelCountsSerializer()
    services_at_risk = serializers.IntegerField()
    revenue_at_risk_cents = serializers.IntegerField()
    expected_loss_cents = serializers.IntegerField()
    explanation = serializers.CharField(help_text='Как считается ожидаемая потеря')


class ChurnChartQuerySerializer(serializers.Serializer):
    days = serializers.IntegerField(min_value=1, max_value=90, default=30)


class ChurnPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    kind = serializers.ChoiceField(['fact', 'forecast'])
    deleted_services = serializers.IntegerField(required=False, help_text='Только для fact')
    expected_non_renewals = serializers.FloatField(
        required=False, help_text='Только для forecast: сумма вероятностей ухода по истекающим услугам',
    )
    services_at_risk = serializers.IntegerField()


class ChurnChartSerializer(serializers.Serializer):
    series = ChurnPointSerializer(many=True)


class SettingsFieldSerializer(serializers.Serializer):
    key = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    type = serializers.ChoiceField(['number', 'integer', 'boolean'])
    default = serializers.JSONField()
    min = serializers.FloatField(required=False)
    max = serializers.FloatField(required=False)


class SettingsSchemaSerializer(serializers.Serializer):
    weights = SettingsFieldSerializer(many=True)
    thresholds = SettingsFieldSerializer(many=True)
    params = SettingsFieldSerializer(many=True)


class ThresholdsSerializer(serializers.Serializer):
    medium = serializers.FloatField()
    high = serializers.FloatField()


class ModelSettingsSerializer(serializers.Serializer):
    weights = serializers.DictField(child=serializers.FloatField())
    thresholds = ThresholdsSerializer()
    params = serializers.DictField(child=serializers.JSONField())
    schema = SettingsSchemaSerializer(read_only=True)


class ModelSettingsPatchSerializer(serializers.Serializer):
    weights = serializers.DictField(child=serializers.FloatField(), required=False)
    thresholds = serializers.DictField(child=serializers.FloatField(), required=False)
    params = serializers.DictField(child=serializers.JSONField(), required=False)


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=False, trim_whitespace=False, style={'input_type': 'password'},
        help_text='Обязателен при создании; при изменении задаёт новый пароль',
    )

    class Meta:
        model = get_user_model()
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'password',
        ]
        read_only_fields = ['is_superuser', 'date_joined', 'last_login']

    def validate_email(self, value):
        # SSO finds the panel user by email, so it must be set and unique
        if not value:
            raise serializers.ValidationError('Укажите email: по нему пользователь входит через SSO')
        users = get_user_model().objects.filter(email__iexact=value)
        if self.instance is not None:
            users = users.exclude(pk=self.instance.pk)
        if users.exists():
            raise serializers.ValidationError('Пользователь с таким email уже есть')
        return value

    def validate(self, attrs):
        request = self.context['request']
        target = self.instance
        if target is None:
            missing = {field: ['Обязательное поле'] for field in ('email', 'password') if not attrs.get(field)}
            if missing:
                raise serializers.ValidationError(missing)
        if attrs.get('password'):
            try:
                validate_password(attrs['password'], user=target)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({'password': list(exc.messages)}) from None
        if target is not None:
            if target.is_superuser and not request.user.is_superuser:
                raise serializers.ValidationError('Суперпользователя может изменить только суперпользователь')
            if target == request.user:
                for field in ('is_active', 'is_staff'):
                    if field in attrs and attrs[field] != getattr(target, field):
                        raise serializers.ValidationError({field: ['Нельзя изменить у своей учётной записи']})
        if 'is_staff' in attrs and attrs['is_staff'] != getattr(target, 'is_staff', False) and not request.user.is_superuser:
            raise serializers.ValidationError({'is_staff': ['Права администратора выдаёт только суперпользователь']})
        return attrs

    # The panel user and its SSO copy in Keycloak are saved together: if Keycloak refuses,
    # nothing is created or changed in the panel either.
    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = get_user_model()(**validated_data)
        user.set_password(password)
        user.save()
        self._sync(lambda: keycloak.create_user(user, password))
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        old_username = instance.username
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        self._sync(lambda: keycloak.update_user(instance, password, username=old_username))
        return instance

    @staticmethod
    def _sync(call):
        if not keycloak.enabled():
            return
        try:
            call()
        except keycloak.KeycloakError as exc:
            raise serializers.ValidationError({'non_field_errors': [f'SSO: {exc}']}) from None


class SnapshotLevelsSerializer(serializers.Serializer):
    high = serializers.IntegerField(source='customers_high')
    medium = serializers.IntegerField(source='customers_medium')
    low = serializers.IntegerField(source='customers_low')
    none = serializers.IntegerField(source='customers_none')


class RecalculationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    reason = serializers.CharField(help_text='snapshot или settings')
    calculated_at = serializers.DateTimeField()
    duration_seconds = serializers.FloatField()
    customers_total = serializers.IntegerField()
    by_level = SnapshotLevelsSerializer(source='*')
    score_avg = serializers.FloatField(allow_null=True)
    services_at_risk = serializers.IntegerField()
    revenue_at_risk_cents = serializers.IntegerField(source='revenue_at_risk')
    expected_loss_cents = serializers.IntegerField(source='expected_loss')


class StatusEventQuerySerializer(serializers.Serializer):
    new_status = serializers.ChoiceField(['active', 'suspended', 'prolong_wait', 'deleted', 'blocked'], required=False)
    customer_id = serializers.IntegerField(required=False)
    service_id = serializers.IntegerField(required=False)


class StatusEventSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    service_id = serializers.IntegerField()
    customer_id = serializers.IntegerField()
    old_status = serializers.CharField()
    new_status = serializers.CharField()
    detected_at = serializers.DateTimeField()


class AdminUserQuerySerializer(serializers.Serializer):
    search = serializers.CharField(required=False, help_text='Часть логина или email')
