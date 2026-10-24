from django.core.management.base import BaseCommand, CommandError

from customers.importer import SnapshotValidationError
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

    def handle(self, *args, extended, **options):
        try:
            result = load_sample(extended=extended)
        except (OSError, SnapshotValidationError) as exc:
            raise CommandError(f'Не удалось загрузить набор: {exc}') from exc
        self.stdout.write(self.style.SUCCESS(
            f'Загружено: клиентов {result.accounts}, услуг {result.services}, '
            f'транзакций {result.transactions}. Оценки пересчитаны.'
        ))
