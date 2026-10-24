"""Модели исходных данных: аккаунты, услуги и транзакции.

Структура повторяет снимок исходной системы (см. «Формат снимка» в docs/api-contract.md).
Первичные ключи берутся из источника, поэтому без автоинкремента.
Все денежные суммы хранятся целыми числами в единицах баланса (100 = €1).
"""

from django.db import models
from django.db.models import F, Q


class BonusState(models.TextChoices):
    LOCKED = 'locked', 'Недоступен'
    UNLOCKED = 'unlocked', 'Доступен'


class ServiceStatus(models.TextChoices):
    ACTIVE = 'active', 'Активна'
    SUSPENDED = 'suspended', 'Выключена'
    PROLONG_WAIT = 'prolong_wait', 'Ожидает оплаты'
    DELETED = 'deleted', 'Удалена'
    BLOCKED = 'blocked', 'Заблокирована'


class PaymentTerm(models.TextChoices):
    HOUR = 'hour', 'Час'
    WEEK = 'week', 'Неделя'
    MONTH = 'month', 'Месяц'
    QUARTER_YEAR = 'quarter_year', 'Квартал'
    HALF_YEAR = 'half_year', 'Полгода'
    YEAR = 'year', 'Год'


class TransactionStatus(models.TextChoices):
    PERFORMED = 'performed', 'Выполнена'
    NOT_PERFORMED = 'not_performed', 'Не выполнена'


class TransactionType(models.TextChoices):
    PROLONG = 'prolong', 'Продление'
    ORDER = 'order', 'Заказ'


class Customer(models.Model):
    """Аккаунт клиента (`accounts` в снимке)."""

    id = models.BigIntegerField('ID', primary_key=True)
    email = models.EmailField('email', unique=True)
    balance = models.BigIntegerField('основной баланс', default=0)
    withdraw_balance = models.BigIntegerField('баланс к выводу', default=0)
    bonus_balance = models.BigIntegerField('бонусный баланс', default=0)
    bonus_state = models.CharField(
        'доступ к бонусам', max_length=16, choices=BonusState.choices, default=BonusState.LOCKED,
    )
    total_replenished = models.BigIntegerField('всего пополнено', default=0)

    class Meta:
        verbose_name = 'клиент'
        verbose_name_plural = 'клиенты'
        ordering = ['id']
        constraints = [
            models.CheckConstraint(condition=Q(balance__gte=0), name='customer_balance_gte_0'),
            models.CheckConstraint(
                condition=Q(withdraw_balance__gte=0), name='customer_withdraw_balance_gte_0',
            ),
            models.CheckConstraint(
                condition=Q(bonus_balance__gte=0), name='customer_bonus_balance_gte_0',
            ),
            models.CheckConstraint(
                condition=Q(total_replenished__gte=0), name='customer_total_replenished_gte_0',
            ),
            models.CheckConstraint(
                condition=Q(bonus_state__in=BonusState.values), name='customer_bonus_state_valid',
            ),
        ]

    def __str__(self):
        return f'#{self.id} {self.email}'

    @property
    def bonus_usable(self) -> bool:
        return self.bonus_state == BonusState.UNLOCKED


class Service(models.Model):
    """Услуга клиента (`services` в снимке)."""

    id = models.BigIntegerField('ID', primary_key=True)
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name='services', verbose_name='клиент',
    )
    name = models.CharField('название', max_length=255)
    status = models.CharField('статус', max_length=16, choices=ServiceStatus.choices)
    payment_term = models.CharField('период оплаты', max_length=16, choices=PaymentTerm.choices)
    price = models.BigIntegerField('стоимость за период')
    auto_prolong = models.BooleanField('автопродление', default=False)
    created_at = models.DateTimeField('создана')
    expires_at = models.DateTimeField('оплачена до')

    class Meta:
        verbose_name = 'услуга'
        verbose_name_plural = 'услуги'
        ordering = ['id']
        indexes = [
            # Основная выборка модели: услуги в учитываемых статусах, истекающие в горизонте.
            models.Index(fields=['status', 'expires_at'], name='service_status_expires_idx'),
            # Окно по датам без фильтра по статусу (график прогноза).
            models.Index(fields=['expires_at'], name='service_expires_idx'),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(price__gte=0), name='service_price_gte_0'),
            models.CheckConstraint(
                condition=Q(status__in=ServiceStatus.values), name='service_status_valid',
            ),
            models.CheckConstraint(
                condition=Q(payment_term__in=PaymentTerm.values), name='service_payment_term_valid',
            ),
            models.CheckConstraint(
                condition=Q(expires_at__gte=F('created_at')), name='service_expires_after_created',
            ),
        ]

    def __str__(self):
        return f'#{self.id} {self.name}'


class Transaction(models.Model):
    """Транзакция по услуге (`transactions` в снимке). Клиент определяется через услугу."""

    id = models.BigIntegerField('ID', primary_key=True)
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name='transactions', verbose_name='услуга',
    )
    type = models.CharField('тип', max_length=16, choices=TransactionType.choices)
    status = models.CharField('статус', max_length=16, choices=TransactionStatus.choices)
    amount = models.BigIntegerField('сумма')
    created_at = models.DateTimeField('создана')
    performed_at = models.DateTimeField('выполнена', null=True, blank=True)

    class Meta:
        verbose_name = 'транзакция'
        verbose_name_plural = 'транзакции'
        ordering = ['id']
        constraints = [
            models.CheckConstraint(condition=Q(amount__gte=0), name='transaction_amount_gte_0'),
            models.CheckConstraint(
                condition=Q(status__in=TransactionStatus.values), name='transaction_status_valid',
            ),
            models.CheckConstraint(
                condition=Q(type__in=TransactionType.values), name='transaction_type_valid',
            ),
            # Выполненная транзакция обязана иметь дату выполнения не раньше создания,
            # невыполненная не должна иметь её вовсе. isnull=False указан явно: в Postgres
            # CHECK с результатом NULL считается пройденным.
            models.CheckConstraint(
                condition=(
                    Q(status=TransactionStatus.NOT_PERFORMED, performed_at__isnull=True)
                    | Q(
                        status=TransactionStatus.PERFORMED,
                        performed_at__isnull=False,
                        performed_at__gte=F('created_at'),
                    )
                ),
                name='transaction_performed_at_consistent',
            ),
        ]

    def __str__(self):
        return f'#{self.id} {self.type} {self.amount}'
