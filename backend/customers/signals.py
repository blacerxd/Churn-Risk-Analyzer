from django.dispatch import Signal

# Отправляется после коммита новой версии снимка. Аргументы: result (ImportResult).
# На него подписывается пересчёт оценок риска, чтобы customers не зависел от analytics.
snapshot_replaced = Signal()
