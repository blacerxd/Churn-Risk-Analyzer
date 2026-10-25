import json
from datetime import datetime

from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import path

from analytics.formatting import money
from analytics.recalculation import current_summary
from customers.importer import SnapshotValidationError, replace_snapshot
from customers.sample_data import load_sample

LEVEL_TITLES = {'high': 'Высокий', 'medium': 'Средний', 'low': 'Низкий', 'none': 'Нет оценки'}


class SnapshotUploadForm(forms.Form):
    file = forms.FileField(label='JSON-файл снимка', help_text='Формат как у PUT /api/v1/source/snapshot')


class ChurnAdminSite(admin.AdminSite):
    site_header = 'Churn Risk Analyzer'
    site_title = 'Churn Risk Analyzer'
    index_title = 'Администрирование'
    index_template = 'admin/churn_index.html'

    def index(self, request, extra_context=None):
        summary = current_summary()
        cards = {
            'customers': summary['customers_total'],
            'services_at_risk': summary['services_at_risk'],
            'revenue_at_risk': money(summary['revenue_at_risk_cents']),
            'expected_loss': money(summary['expected_loss_cents']),
            'levels': [(level, LEVEL_TITLES[level], count) for level, count in summary['by_level'].items()],
        }
        if summary['calculated_at']:
            calculated = datetime.fromisoformat(summary['calculated_at'].replace('Z', '+00:00'))
            cards['calculated_at'] = calculated.strftime('%d.%m.%Y %H:%M UTC')
        context = {'summary': summary, 'cards': cards, **(extra_context or {})}
        return super().index(request, context)

    def get_urls(self):
        return [path('data/', self.admin_view(self.data_view), name='data'), *super().get_urls()]

    def data_view(self, request):
        """Snapshot upload and the sample sets, same as the panel's «Данные» page."""
        form = SnapshotUploadForm()
        errors, errors_total = [], 0
        if request.method == 'POST':
            action = request.POST.get('action')
            if action in ('sample', 'sample-extended'):
                result = load_sample(extended=action == 'sample-extended')
                self._report(request, result)
                return redirect('admin:data')
            form = SnapshotUploadForm(request.POST, request.FILES)
            if form.is_valid():
                try:
                    payload = json.loads(form.cleaned_data['file'].read())
                    result = replace_snapshot(payload)
                except (UnicodeDecodeError, json.JSONDecodeError):
                    form.add_error('file', 'Файл не является корректным JSON')
                except SnapshotValidationError as exc:
                    errors = [f'{error.path}: {error.message}' for error in exc.errors]
                    errors_total = exc.total
                    messages.error(request, f'{exc}. Данные не изменены.')
                else:
                    self._report(request, result)
                    return redirect('admin:data')
        context = {
            **self.each_context(request),
            'title': 'Загрузка данных',
            'form': form,
            'errors': errors,
            'errors_total': errors_total,
            'summary': current_summary(),
        }
        return TemplateResponse(request, 'admin/churn_data.html', context)

    @staticmethod
    def _report(request, result):
        messages.success(
            request,
            f'Загружено: клиентов {result.accounts}, услуг {result.services}, транзакций {result.transactions}, '
            f'смен статуса {result.status_changes}. Оценки пересчитаны.',
        )
