"""Пересчёт оценок риска всех клиентов.

Запускается в той же транзакции, что и изменение, которое его вызвало (загрузка снимка или
сохранение настроек, см. analytics.receivers), поэтому панель никогда не видит новые данные
со старыми оценками. Результаты читаются API из RiskAssessment и AnalyticsSnapshot,
на лету ничего не пересчитывается.
"""

import time
from collections import defaultdict
from collections.abc import Mapping
from dataclasses import asdict
from datetime import datetime

from django.db import transaction
from django.utils import timezone

from customers.locking import lock_source_data
from customers.models import Customer, Service, Transaction

from .context import CustomerContext
from .features import FEATURES, Feature
from .model_settings import load_config
from .models import AnalyticsSnapshot, RecalcReason, RiskAssessment
from .money import customer_money, explanation, portfolio_money
from .scoring import RiskLevel, compute
from .signals import recalculated

BULK_BATCH_SIZE = 1000


def _load_source_data():
    """Клиенты с услугами и транзакциями: три запроса на весь портфель, без N+1."""
    customers = {customer.id: customer for customer in Customer.objects.order_by('id')}
    services, transactions, owners = defaultdict(list), defaultdict(list), {}
    for service in Service.objects.order_by('id'):
        service.customer = customers[service.customer_id]
        services[service.customer_id].append(service)
        owners[service.id] = service
    for item in Transaction.objects.order_by('id'):
        item.service = owners[item.service_id]
        transactions[item.service.customer_id].append(item)
    return customers.values(), services, transactions


def recalculate_all(
    reason: RecalcReason,
    *,
    now: datetime | None = None,
    features: Mapping[str, Feature] = FEATURES,
) -> AnalyticsSnapshot:
    """Оценивает всех клиентов по действующим настройкам и сохраняет результаты.

    Оценки заменяются целиком, итоги добавляются новой записью AnalyticsSnapshot.
    Выполняется под блокировкой исходных данных: одновременные пересчёты и загрузки
    идут по очереди, и последним всегда остаётся результат по последним данным и настройкам.
    """
    started = time.perf_counter()
    now = now or timezone.now()

    with transaction.atomic():
        lock_source_data()
        # Настройки читаются после блокировки: пересчёт, ждавший очереди, берёт свежие.
        config = load_config(features)
        customers, services, transactions = _load_source_data()

        assessments, money_by_level = [], []
        for customer in customers:
            ctx = CustomerContext(
                customer=customer, services=services[customer.id],
                transactions=transactions[customer.id], now=now, params=config.params,
            )
            assessment = compute(ctx, config, features)
            money = customer_money(ctx.services, assessment.score, config.params)
            money_by_level.append((assessment.level, money))
            assessments.append(RiskAssessment(
                customer=customer,
                score=assessment.score,
                level=assessment.level,
                probability=assessment.probability,
                top_reason=assessment.top_reason,
                factors=[asdict(factor) for factor in assessment.factors],
                services=[asdict(item) for item in money.services],
                monthly_revenue=money.monthly_revenue,
                expected_loss=money.expected_loss,
                calculated_at=now,
            ))

        RiskAssessment.objects.all().delete()
        RiskAssessment.objects.bulk_create(assessments, batch_size=BULK_BATCH_SIZE)

        portfolio = portfolio_money(money_by_level, config.params)
        levels = {level: 0 for level in RiskLevel}
        for item in assessments:
            levels[item.level] += 1
        scores = [item.score for item in assessments if item.score is not None]
        snapshot = AnalyticsSnapshot.objects.create(
            reason=reason,
            calculated_at=now,
            duration_seconds=time.perf_counter() - started,
            customers_total=len(assessments),
            customers_high=levels[RiskLevel.HIGH],
            customers_medium=levels[RiskLevel.MEDIUM],
            customers_low=levels[RiskLevel.LOW],
            customers_none=levels[RiskLevel.NONE],
            score_avg=round(sum(scores) / len(scores), 1) if scores else None,
            services_at_risk=portfolio.services_at_risk,
            revenue_at_risk=portfolio.revenue_at_risk,
            expected_loss=portfolio.expected_loss,
            explanation=explanation(config.params),
        )
        # Получатели (SSE) сами откладывают рассылку до коммита.
        recalculated.send(sender=AnalyticsSnapshot, reason=reason, summary=snapshot.summary())
    return snapshot


def current_summary() -> dict:
    """Действующие итоги для summary; до первого пересчёта — нули и calculated_at = null."""
    snapshot = AnalyticsSnapshot.objects.order_by('-calculated_at', '-id').first()
    if snapshot is not None:
        return snapshot.summary()
    return {
        'calculated_at': None,
        'customers_total': 0,
        'by_level': {level.value: 0 for level in RiskLevel},
        'services_at_risk': 0,
        'revenue_at_risk_cents': 0,
        'expected_loss_cents': 0,
        'explanation': explanation(load_config().params),
    }
