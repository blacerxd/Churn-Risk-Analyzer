"""Собирает demo.json: клиенты для демонстрации всех сценариев модели риска.

Даты задаются относительно опорной даты набора кейса (2026-10-19T15:00:00.000Z), формат
и ограничения — как в test_data/001_schema.up.sql. Python 3.10+, без зависимостей.

    python3 build_demo.py            # перезаписывает demo.json рядом со скриптом
"""

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

REFERENCE = datetime(2026, 10, 19, 15, 0, tzinfo=timezone.utc)
TERMS = {
    'hour': timedelta(hours=1), 'week': timedelta(weeks=1), 'month': timedelta(days=30),
    'year': timedelta(days=365),
}

# Каждый сценарий: клиент, его услуги и неоплаченные заказы. Ожидаемый уровень на опорную
# дату проверяется тестом analytics/tests/test_sample_load.py.
SCENARIOS = [
    {
        'id': 101, 'title': 'prolong_wait и пустой баланс', 'level': 'high',
        'account': {'balance': 0, 'bonusBalance': 0},
        'services': [{'name': 'VPS-Wait', 'status': 'prolong_wait', 'paymentTerm': 'month',
                      'price': 1500, 'autoProlong': True, 'expires_in': timedelta(days=-2)}],
    },
    {
        'id': 102, 'title': 'Истекает через 12 часов без автопродления, денег нет', 'level': 'high',
        'account': {'balance': 0, 'bonusBalance': 0},
        'services': [{'name': 'VPS-Last-Day', 'paymentTerm': 'month', 'price': 2500,
                      'autoProlong': False, 'expires_in': timedelta(hours=12)}],
    },
    {
        'id': 103, 'title': 'Истекает через день без автопродления, деньги есть', 'level': 'medium',
        'account': {'balance': 50_000},
        'services': [{'name': 'VPS-Manual', 'paymentTerm': 'month', 'price': 2500,
                      'autoProlong': False, 'expires_in': timedelta(days=1)}],
    },
    {
        'id': 104, 'title': 'Бонусы заблокированы (bonusState = locked)', 'level': 'medium',
        'account': {'balance': 200, 'bonusBalance': 5000, 'bonusState': 'locked'},
        'services': [{'name': 'VPS-Bonus-Locked', 'paymentTerm': 'month', 'price': 1200,
                      'autoProlong': True, 'expires_in': timedelta(days=3)}],
    },
    {
        'id': 105, 'title': 'То же, но бонусы доступны (bonusState = unlocked)', 'level': 'low',
        'account': {'balance': 200, 'bonusBalance': 5000, 'bonusState': 'unlocked'},
        'services': [{'name': 'VPS-Bonus-Open', 'paymentTerm': 'month', 'price': 1200,
                      'autoProlong': True, 'expires_in': timedelta(days=3)}],
    },
    {
        'id': 106, 'title': 'Почасовая оплата, баланса хватит меньше чем на сутки',
        'level': 'medium',
        'account': {'balance': 100},
        'services': [{'name': 'GPU-Hourly', 'paymentTerm': 'hour', 'price': 5,
                      'autoProlong': True, 'expires_in': timedelta(minutes=30)}],
    },
    {
        'id': 107, 'title': 'Деньги только на реферальном балансе (withdrawBalance)',
        'level': 'medium',
        'account': {'balance': 0, 'withdrawBalance': 100_000},
        'services': [{'name': 'VPS-Referral', 'paymentTerm': 'month', 'price': 2000,
                      'autoProlong': True, 'expires_in': timedelta(days=2)}],
    },
    {
        'id': 108, 'title': 'Услуга приостановлена (suspended), денег на продление нет',
        'level': 'medium',
        'account': {'balance': 0},
        'services': [{'name': 'VPS-Suspended', 'status': 'suspended', 'paymentTerm': 'week',
                      'price': 700, 'autoProlong': True, 'expires_in': timedelta(days=5)}],
    },
    {
        'id': 109, 'title': 'Часто не оплачивает заказы (not_performed)', 'level': 'low',
        'account': {'balance': 100_000},
        'services': [{'name': 'VPS-Orders', 'paymentTerm': 'year', 'price': 12_000,
                      'autoProlong': True, 'expires_in': timedelta(days=200)}],
        'unpaid_orders': 4,
    },
    {
        'id': 110, 'title': 'Надёжный клиент: годовая услуга с автопродлением', 'level': 'low',
        'account': {'balance': 50_000, 'totalReplenished': 500_000},
        'services': [{'name': 'Dedicated-Year', 'paymentTerm': 'year', 'price': 12_000,
                      'autoProlong': True, 'expires_in': timedelta(days=200)}],
    },
    {
        'id': 111, 'title': 'Без услуг', 'level': 'none',
        'account': {}, 'services': [],
    },
    {
        'id': 112, 'title': 'Только удалённая и заблокированная услуги', 'level': 'none',
        'account': {},
        'services': [
            {'name': 'VPS-Deleted', 'status': 'deleted', 'paymentTerm': 'month', 'price': 1500,
             'autoProlong': False, 'expires_in': timedelta(days=-10)},
            {'name': 'VPS-Blocked', 'status': 'blocked', 'paymentTerm': 'month', 'price': 1500,
             'autoProlong': False, 'expires_in': timedelta(days=10)},
        ],
    },
]


def iso(value):
    return value.isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def build():
    accounts, services, transactions = [], [], []
    service_id, transaction_id = 1000, 10_000
    for scenario in SCENARIOS:
        customer_id = scenario['id']
        accounts.append({
            'id': customer_id, 'email': f'demo-{customer_id:04d}@example.test',
            'balance': 10_000, 'withdrawBalance': 0, 'totalReplenished': 50_000,
            'bonusBalance': 0, 'bonusState': 'unlocked',
        } | scenario['account'])
        for item in scenario['services']:
            service_id += 1
            expires = REFERENCE + item['expires_in']
            created = expires - TERMS[item['paymentTerm']]
            services.append({
                'id': service_id, 'name': item['name'], 'ownerId': customer_id,
                'paymentTerm': item['paymentTerm'], 'autoProlong': item['autoProlong'],
                'createdAt': iso(created), 'expiresAt': iso(expires),
                'status': item.get('status', 'active'), 'price': item['price'],
            })
            transaction_id += 1
            transactions.append({
                'id': transaction_id, 'amount': min(item['price'], 1000), 'status': 'performed',
                'performedAt': iso(created + timedelta(minutes=1)), 'createdAt': iso(created),
                'type': 'order', 'serviceId': service_id,
            })
            for n in range(scenario.get('unpaid_orders', 0)):
                transaction_id += 1
                transactions.append({
                    'id': transaction_id, 'amount': 500, 'status': 'not_performed',
                    'performedAt': None, 'createdAt': iso(REFERENCE - timedelta(days=n + 1)),
                    'type': 'order', 'serviceId': service_id,
                })
    return {'accounts': accounts, 'services': services, 'transactions': transactions}


def main():
    out = Path(__file__).with_name('demo.json')
    out.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Created {out.name}: {len(SCENARIOS)} demo accounts')


if __name__ == '__main__':
    main()
