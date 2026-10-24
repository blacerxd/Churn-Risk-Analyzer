from django.contrib import admin

from .models import Customer, Service, Transaction


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'balance', 'bonus_balance', 'bonus_state', 'total_replenished')
    list_filter = ('bonus_state',)
    search_fields = ('email',)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'name', 'customer', 'status', 'payment_term', 'price', 'auto_prolong', 'expires_at',
    )
    list_filter = ('status', 'payment_term', 'auto_prolong')
    search_fields = ('name', 'customer__email')
    list_select_related = ('customer',)
    raw_id_fields = ('customer',)
    date_hierarchy = 'expires_at'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'service', 'type', 'status', 'amount', 'created_at', 'performed_at')
    list_filter = ('type', 'status')
    search_fields = ('service__name', 'service__customer__email')
    list_select_related = ('service',)
    raw_id_fields = ('service',)
