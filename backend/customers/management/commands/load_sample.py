from django.core.management.base import BaseCommand, CommandError

from customers.importer import SnapshotValidationError
from customers.models import Customer
from customers.sample_data import load_sample


class Command(BaseCommand):
    help = (
        'Загружает тестовый набор кейса из sample-data/ вместо текущих данных и пересчитывает '
        'оценки. Даты сдвигаются так, что опорная дата набора (19.10.2026 15:00 UTC) '
        'становится текущим моментом.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--extended', action='store_true',
            help='Добавить демонстрационные сценарии (sample-data/demo.json).',
        )
        parser.add_argument(
            '--if-empty', action='store_true',
            help='Загружать, только если в базе ещё нет клиентов (автозагрузка при старте).',
        )

    def handle(self, *args, extended, if_empty, **options):
        if if_empty and Customer.objects.exists():
            self.stdout.write('Данные уже загружены, пропускаю')
            return
        try:
            result = load_sample(extended=extended)
        except (OSError, SnapshotValidationError) as exc:
            raise CommandError(f'Не удалось загрузить набор: {exc}') from exc
        self.stdout.write(self.style.SUCCESS(
            f'Загружено: клиентов {result.accounts}, услуг {result.services}, '
            f'транзакций {result.transactions}. Оценки пересчитаны.'
        ))
