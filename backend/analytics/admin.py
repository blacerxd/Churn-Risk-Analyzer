from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html, format_html_join

from customers.admin import level_badge

from .formatting import money
from .model_settings import SettingsValidationError, apply_patch, effective_values, get_schema, update_settings
from .models import AnalyticsSnapshot, ModelSettings, RiskAssessment

SECTIONS = {'weights': 'Веса признаков', 'thresholds': 'Пороги уровней', 'params': 'Параметры'}


class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


def field_name(section, key):
    return f'{section}__{key}'


def settings_form_class():
    """Form fields are built from get_schema(), so a new feature gets its weight field automatically."""
    fields = {}
    for section, specs in get_schema().items():
        for spec in specs:
            help_text = f"{spec['description']} По умолчанию: {spec['default']}."
            if spec['type'] == 'boolean':
                field = forms.BooleanField(required=False, label=spec['title'], help_text=help_text)
            elif spec['type'] == 'integer':
                field = forms.IntegerField(label=spec['title'], help_text=help_text, min_value=spec['min'], max_value=spec['max'])
            else:
                field = forms.FloatField(label=spec['title'], help_text=help_text, min_value=spec['min'], max_value=spec['max'])
            fields[field_name(section, spec['key'])] = field
    return type('ModelSettingsForm', (ModelSettingsFormBase,), fields)


class ModelSettingsFormBase(forms.ModelForm):
    class Meta:
        model = ModelSettings
        fields = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.current = effective_values(self.instance)
        for section, values in self.current.items():
            for key, value in values.items():
                name = field_name(section, key)
                if name in self.fields:
                    self.fields[name].initial = value

    def clean(self):
        cleaned = super().clean()
        # Only changed fields are saved: untouched ones keep following defaults from code
        self.patch = {}
        for name in self.changed_data:
            section, key = name.split('__', 1)
            self.patch.setdefault(section, {})[key] = cleaned.get(name)
        try:
            apply_patch(self.current, self.patch)
        except SettingsValidationError as exc:
            for error in exc.errors:
                name = error.path.replace('.', '__')
                self.add_error(name if name in self.fields else None, error.message)
        return cleaned


@admin.register(ModelSettings)
class ModelSettingsAdmin(admin.ModelAdmin):
    # Same validation as PATCH /api/v1/model/settings, saving starts the recalculation and the SSE event.

    def get_form(self, request, obj=None, change=False, **kwargs):
        kwargs['form'] = settings_form_class()
        kwargs['fields'] = list(kwargs['form'].base_fields)
        return super().get_form(request, obj, change, **kwargs)

    def get_fieldsets(self, request, obj=None):
        return [
            (title, {'fields': [field_name(section, spec['key']) for spec in get_schema()[section]]})
            for section, title in SECTIONS.items()
        ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        settings = ModelSettings.load()
        return redirect(reverse('admin:analytics_modelsettings_change', args=[settings.pk]))

    def save_model(self, request, obj, form, change):
        if form.patch:
            update_settings(form.patch)
            messages.success(request, 'Оценки пересчитаны, открытые панели обновятся сами.')

    def response_change(self, request, obj):
        response = super().response_change(request, obj)
        # There is no list to return to: stay on the settings page
        if '_continue' not in request.POST:
            return redirect(reverse('admin:analytics_modelsettings_change', args=[obj.pk]))
        return response


@admin.register(RiskAssessment)
class RiskAssessmentAdmin(ReadOnlyAdmin):
    # Оценки пишет только пересчёт.
    list_display = ('customer', 'level_display', 'score', 'expected_loss_display', 'top_reason', 'calculated_at')
    list_filter = ('level',)
    search_fields = ('customer__email',)
    list_select_related = ('customer',)
    ordering = ('-score',)
    fields = (
        'customer', 'level_display', 'score', 'probability', 'top_reason', 'factors_display',
        'monthly_revenue_display', 'expected_loss_display', 'calculated_at',
    )
    readonly_fields = fields

    @admin.display(description='уровень', ordering='level')
    def level_display(self, obj):
        return level_badge(obj.level)

    @admin.display(description='ожидаемая потеря', ordering='expected_loss')
    def expected_loss_display(self, obj):
        return money(obj.expected_loss)

    @admin.display(description='месячная стоимость услуг')
    def monthly_revenue_display(self, obj):
        return money(obj.monthly_revenue)

    @admin.display(description='признаки')
    def factors_display(self, obj):
        rows = format_html_join(
            '', '<li><strong>{}</strong> — вклад {}<br>{}</li>',
            ((f['title'], f['contribution'], f['explanation']) for f in obj.factors),
        )
        return format_html('<ul class="factor-list">{}</ul>', rows) if obj.factors else '—'


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(ReadOnlyAdmin):
    # Итоги пересчётов: история для графика и /metrics.
    list_display = (
        'calculated_at', 'reason', 'customers_total', 'customers_high', 'customers_medium',
        'services_at_risk', 'expected_loss_display', 'duration_seconds',
    )
    list_filter = ('reason',)
    date_hierarchy = 'calculated_at'

    @admin.display(description='ожидаемая потеря', ordering='expected_loss')
    def expected_loss_display(self, obj):
        return money(obj.expected_loss)
