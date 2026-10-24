from django.dispatch import Signal

# Sent by recalculate_all() after results are saved.
# kwargs: reason ("settings" | "snapshot"), summary (dict, same shape as /analytics/summary)
recalculated = Signal()
