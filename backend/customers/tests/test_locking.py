import pytest
from django.db import connection, transaction

from customers.locking import SOURCE_DATA_LOCK_KEY, lock_source_data

postgres_only = pytest.mark.skipif(
    connection.vendor != 'postgresql', reason='advisory lock есть только в PostgreSQL',
)


def held_advisory_locks():
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT objid FROM pg_locks WHERE locktype = 'advisory' AND pid = pg_backend_pid()",
        )
        return [row[0] for row in cursor.fetchall()]


@pytest.mark.django_db(transaction=True)
def test_requires_transaction():
    # Без transaction.atomic() блокировка xact снялась бы сразу после запроса.
    with pytest.raises(RuntimeError, match='transaction.atomic'):
        lock_source_data()


@postgres_only
@pytest.mark.django_db
def test_lock_is_held_until_end_of_transaction():
    with transaction.atomic():
        lock_source_data()
        lock_source_data()  # повторный вызов в той же транзакции не ждёт
        assert SOURCE_DATA_LOCK_KEY in held_advisory_locks()
