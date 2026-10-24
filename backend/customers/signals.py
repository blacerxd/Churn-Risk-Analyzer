from django.dispatch import Signal

# Отправляется внутри транзакции загрузки снимка, после записи данных. Аргументы: result
# (ImportResult). Получатели работают в той же транзакции: их ошибка откатывает загрузку.
# На него подписывается пересчёт оценок риска, чтобы customers не зависел от analytics.
snapshot_replaced = Signal()
