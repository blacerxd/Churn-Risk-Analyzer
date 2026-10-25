from django.contrib.auth import get_user_model
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username']


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
CUSTOMER_ORDERING = ['id', 'email', 'balance', 'total_replenished', 'score', 'expected_loss']


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
