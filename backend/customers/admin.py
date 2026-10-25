from django.contrib import admin
from django.db.models import F
from django.utils import timezone
from django.utils.html import format_html, format_html_join

from analytics.formatting import money
from analytics.money import monthly_equivalent

from .models import Customer, Service, ServiceStatusEvent, Transaction

LEVEL_TITLES = {'high': 'Высокий', 'medium': 'Средний', 'low': 'Низкий', 'none': 'Нет оценки'}


def level_badge(level):
    return format_html('<span class="level level-{}">{}</span>', level, LEVEL_TITLES.get(level, level))


class SourceDataAdmin(admin.ModelAdmin):
    """Source data comes only with a snapshot (admin «Загрузка данных» or the API).

    A manual edit would diverge from the source system and from the risk scores,
    and the next snapshot would overwrite it anyway.
    """

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class ServiceInline(admin.TabularInline):
    model = Service
    fields = ('name', 'status', 'payment_term', 'price_display', 'monthly_display', 'auto_prolong', 'expires_at', 'days_left')
    readonly_fields = fields
    extra = 0
    show_change_link = True
    ordering = ('expires_at',)

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.display(description='цена за период')
    def price_display(self, obj):
        return money(obj.price)

    @admin.display(description='в месяц')
    def monthly_display(self, obj):
        return money(monthly_equivalent(obj.price, obj.payment_term))

    @admin.display(description='дней до окончания')
    def days_left(self, obj):
        return (obj.expires_at - timezone.now()).days


@admin.register(Customer)
class CustomerAdmin(SourceDataAdmin):
    list_display = (
        'id', 'email', 'level_display', 'score_display', 'expected_loss_display', 'balance_display',
        'top_reason_display',
    )
    list_display_links = ('id', 'email')
    list_filter = ('risk__level', 'bonus_state')
    search_fields = ('email', '=id')
    list_select_related = ('risk',)
    ordering = (F('risk__score').desc(nulls_last=True), 'id')
    list_per_page = 50
    inlines = [ServiceInline]
    fieldsets = (
        ('Клиент', {'fields': ('id', 'email', 'panel_link')}),
        ('Оценка риска', {'fields': ('level_display', 'score_display', 'expected_loss_display', 'calculated_at', 'factors_display')}),
        ('Баланс', {'fields': (
            'balance_display', 'bonus_balance_display', 'bonus_state', 'withdraw_balance_display',
            'total_replenished_display',
        )}),
        ('Последние транзакции', {'fields': ('transactions_display',)}),
    )
    readonly_fields = (
        'id', 'email', 'panel_link', 'level_display', 'score_display', 'expected_loss_display', 'calculated_at',
        'factors_display', 'balance_display', 'bonus_balance_display', 'bonus_state',
        'withdraw_balance_display', 'total_replenished_display', 'transactions_display',
    )

    @staticmethod
    def _risk(obj):
        return getattr(obj, 'risk', None)

    @admin.display(description='уровень', ordering='risk__level')
    def level_display(self, obj):
        risk = self._risk(obj)
        return level_badge(risk.level if risk else 'none')

    @admin.display(description='score', ordering=F('risk__score').desc(nulls_last=True))
    def score_display(self, obj):
        risk = self._risk(obj)
        return risk.score if risk and risk.score is not None else '—'

    @admin.display(description='ожидаемая потеря', ordering='risk__expected_loss')
    def expected_loss_display(self, obj):
        risk = self._risk(obj)
        return money(risk.expected_loss) if risk else '—'

    @admin.display(description='главная причина')
    def top_reason_display(self, obj):
        risk = self._risk(obj)
        return risk.top_reason if risk else 'Недостаточно данных для оценки'

    @admin.display(description='рассчитано')
    def calculated_at(self, obj):
        risk = self._risk(obj)
        return risk.calculated_at.strftime('%d.%m.%Y %H:%M UTC') if risk else '—'

    @admin.display(description='признаки')
    def factors_display(self, obj):
        risk = self._risk(obj)
        if not risk or not risk.factors:
            return '—'
        score = risk.score or 0
        rows = format_html_join(
            '', '<li><strong>{}</strong> — вклад {} (вес {})<br>{}<div class="factor-bar"><span style="width: {}%"></span></div></li>',
            (
                (f['title'], f['contribution'], f['weight'], f['explanation'],
                 round(100 * f['contribution'] / score) if score else 0)
                for f in risk.factors
            ),
        )
        return format_html('<ul class="factor-list">{}</ul>', rows)

    @admin.display(description='карточка в панели')
    def panel_link(self, obj):
        return format_html('<a class="button" href="/customers/{}">Открыть в панели</a>', obj.id)

    @admin.display(description='основной баланс', ordering='balance')
    def balance_display(self, obj):
        return money(obj.balance)

    @admin.display(description='бонусный баланс')
    def bonus_balance_display(self, obj):
        return money(obj.bonus_balance)

    @admin.display(description='баланс к выводу')
    def withdraw_balance_display(self, obj):
        return money(obj.withdraw_balance)

    @admin.display(description='всего пополнено', ordering='total_replenished')
    def total_replenished_display(self, obj):
        return money(obj.total_replenished)

    @admin.display(description='транзакции')
    def transactions_display(self, obj):
        items = (
            Transaction.objects.filter(service__customer=obj)
            .select_related('service').order_by('-created_at')[:20]
        )
        rows = format_html_join(
            '', '<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td><td>{}</td></tr>',
            (
                (t.created_at.strftime('%d.%m.%Y %H:%M'), t.service.name, t.get_type_display(),
                 t.get_status_display(), money(t.amount))
                for t in items
            ),
        )
        if not rows:
            return '—'
        return format_html(
            '<table><thead><tr><th>создана</th><th>услуга</th><th>тип</th><th>статус</th><th>сумма</th></tr></thead>'
            '<tbody>{}</tbody></table>', rows,
        )


@admin.register(Service)
class ServiceAdmin(SourceDataAdmin):
    list_display = (
        'id', 'name', 'customer', 'status', 'payment_term', 'price_display', 'auto_prolong', 'expires_at',
    )
    list_filter = ('status', 'payment_term', 'auto_prolong')
    search_fields = ('name', 'customer__email', '=id')
    list_select_related = ('customer',)
    date_hierarchy = 'expires_at'
    readonly_fields = ('price_display', 'monthly_display')

    @admin.display(description='цена за период', ordering='price')
    def price_display(self, obj):
        return money(obj.price)

    @admin.display(description='в месяц')
    def monthly_display(self, obj):
        return money(monthly_equivalent(obj.price, obj.payment_term))


@admin.register(Transaction)
class TransactionAdmin(SourceDataAdmin):
    list_display = ('id', 'service', 'customer_display', 'type', 'status', 'amount_display', 'created_at', 'performed_at')
    list_filter = ('type', 'status')
    search_fields = ('service__name', 'service__customer__email', '=id')
    list_select_related = ('service__customer',)
    date_hierarchy = 'created_at'

    @admin.display(description='клиент', ordering='service__customer__email')
    def customer_display(self, obj):
        return obj.service.customer

    @admin.display(description='сумма', ordering='amount')
    def amount_display(self, obj):
        return money(obj.amount)


@admin.register(ServiceStatusEvent)
class ServiceStatusEventAdmin(SourceDataAdmin):
    # Журнал копится автоматически при загрузке снимков, ручное редактирование исказит факты.
    list_display = ('detected_at', 'service_id', 'customer_id', 'old_status', 'new_status')
    list_filter = ('new_status', 'old_status')
    search_fields = ('=service_id', '=customer_id')
    date_hierarchy = 'detected_at'
