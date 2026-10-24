import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from customers.importer import SnapshotValidationError, replace_snapshot
from customers.models import Customer


class Command(BaseCommand):
    help = 'Загружает снимок исходных данных из JSON-файла (полная замена данных).'

    def add_arguments(self, parser):
        parser.add_argument('path', type=Path)
        parser.add_argument(
            '--if-empty', action='store_true',
            help='Загружать, только если в базе ещё нет клиентов',
        )

    def handle(self, path, if_empty, **options):
        if if_empty and Customer.objects.exists():
            self.stdout.write('Данные уже загружены, пропускаю')
            return

        try:
            payload = json.loads(path.read_text(encoding='utf-8'))
        except FileNotFoundError:
            raise CommandError(f'Файл не найден: {path}') from None
        except json.JSONDecodeError as exc:
            raise CommandError(f'{path} не является корректным JSON: {exc}') from None

        try:
            result = replace_snapshot(payload)
        except SnapshotValidationError as exc:
            lines = [f'  {e.path}: {e.message}' for e in exc.errors]
            raise CommandError('\n'.join([str(exc), *lines])) from None

        self.stdout.write(self.style.SUCCESS(
            f'Загружено: аккаунтов {result.accounts}, услуг {result.services}, '
            f'транзакций {result.transactions}'
        ))
