from django.contrib import admin

from .models import ModelSettings


@admin.register(ModelSettings)
class ModelSettingsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'updated_at')
    readonly_fields = ('weights', 'thresholds', 'params', 'updated_at')

    # Настройки меняются через панель (PATCH /api/v1/model/settings) с валидацией;
    # правка JSON в админке обошла бы её.
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
