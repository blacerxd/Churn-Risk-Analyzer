from customers.models import TransactionStatus

from .registry import FeatureResult, feature

# Меньше трёх транзакций — одна неоплаченная дала бы сразу 100 %: это шум, а не сигнал.
MIN_TRANSACTIONS = 3


@feature(
    'low_payment_success', 'Неоплаченные транзакции', 20,
    'Доля транзакций в статусе not_performed: заказ или продление созданы, но не оплачены. '
    f'Оценивается, если транзакций не меньше {MIN_TRANSACTIONS}.',
)
def low_payment_success(ctx):
    total = len(ctx.transactions)
    if total < MIN_TRANSACTIONS:
        return FeatureResult(0.0, (
            f'Транзакций для оценки мало: {total} при минимуме {MIN_TRANSACTIONS}'
        ))

    failed = sum(1 for t in ctx.transactions if t.status == TransactionStatus.NOT_PERFORMED)
    share = failed / total
    return FeatureResult(share, f'Не оплачено транзакций: {failed} из {total} ({share:.0%})')
