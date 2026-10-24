"""Входные данные для оценки одного клиента."""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime
from functools import cached_property

from customers.models import Customer, Service, ServiceStatus, Transaction

# Услуги, по которым клиент ещё может продлиться или уйти. deleted и blocked уже потеряны
# или недоступны и в оценку не входят.
SCORED_STATUSES = frozenset({
    ServiceStatus.ACTIVE, ServiceStatus.SUSPENDED, ServiceStatus.PROLONG_WAIT,
})


@dataclass(frozen=True)
class ModelParams:
    expiry_horizon_days: int = 7
    use_bonus_balance: bool = True
    loss_horizon_months: int = 1


@dataclass(frozen=True)
class CustomerContext:
    customer: Customer
    services: Sequence[Service]
    transactions: Sequence[Transaction]
    now: datetime
    params: ModelParams

    def __post_init__(self):
        # Даты услуг хранятся в UTC; сравнение с наивным временем дало бы TypeError в признаках.
        if self.now.tzinfo is None:
            raise ValueError('now должен содержать часовой пояс')

    @cached_property
    def scored_services(self) -> list[Service]:
        return [service for service in self.services if service.status in SCORED_STATUSES]

    @cached_property
    def available_funds(self) -> int:
        """Средства, с которых может пройти продление: основной баланс и, если можно, бонусы."""
        funds = self.customer.balance
        if self.params.use_bonus_balance and self.customer.bonus_usable:
            funds += self.customer.bonus_balance
        return funds
