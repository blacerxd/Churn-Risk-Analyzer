"""Блокировка исходных данных на время записи.

Загрузка снимка и пересчёт оценок берут одну и ту же блокировку: пересчёт не увидит
наполовину заменённый снимок, а два пересчёта не затрут результаты друг друга.
"""

from django.db import connection

# Произвольный постоянный ключ advisory-блокировки PostgreSQL.
SOURCE_DATA_LOCK_KEY = 0x5A4E4150


def lock_source_data():
    """Блокирует исходные данные до конца текущей транзакции.

    Повторный вызов в той же транзакции не ждёт: блокировка PostgreSQL реентерабельна,
    поэтому пересчёт внутри загрузки снимка берёт её без взаимоблокировки.
    В SQLite (локальные тесты) запись и так сериализуется блокировкой файла БД.
    """
    if not connection.in_atomic_block:
        raise RuntimeError('lock_source_data() вызывается только внутри transaction.atomic()')
    if connection.vendor == 'postgresql':
        with connection.cursor() as cursor:
            cursor.execute('SELECT pg_advisory_xact_lock(%s)', [SOURCE_DATA_LOCK_KEY])
