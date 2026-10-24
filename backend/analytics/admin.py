from django.contrib import admin

from .models import AnalyticsSnapshot, ModelSettings, RiskAssessment


class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(ModelSettings)
class ModelSettingsAdmin(ReadOnlyAdmin):
    # Настройки меняются через панель (PATCH /api/v1/model/settings) с валидацией;
    # правка JSON в админке обошла бы её.
    list_display = ('__str__', 'updated_at')
    readonly_fields = ('weights', 'thresholds', 'params', 'updated_at')


# Оценки и итоги пишет только пересчёт.
@admin.register(RiskAssessment)
class RiskAssessmentAdmin(ReadOnlyAdmin):
    list_display = ('customer', 'score', 'level', 'expected_loss', 'top_reason', 'calculated_at')
    list_filter = ('level',)
    search_fields = ('customer__email',)
    list_select_related = ('customer',)
    ordering = ('-score',)


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(ReadOnlyAdmin):
    list_display = (
        'calculated_at', 'reason', 'customers_total', 'customers_high', 'customers_medium',
        'expected_loss', 'duration_seconds',
    )
    list_filter = ('reason',)
    date_hierarchy = 'calculated_at'
