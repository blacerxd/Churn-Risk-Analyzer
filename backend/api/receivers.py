from django.db import transaction
from django.dispatch import receiver
from django.utils import timezone

from analytics.signals import recalculated
from api.events import broker


@receiver(recalculated)
def broadcast_recalculated(sender, reason, summary=None, **kwargs):
    payload = {'reason': reason, 'at': timezone.now().isoformat(), 'summary': summary}
    transaction.on_commit(lambda: broker.publish('recalculated', payload))
