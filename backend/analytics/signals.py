from django.dispatch import Signal

# Sent by recalculate_all() after results are saved.
# kwargs: reason ("settings" | "snapshot"), summary (dict, same shape as /analytics/summary)
recalculated = Signal()

# Sent by update_settings() inside its transaction, after the new settings are saved.
# The recalculation receiver runs in the same transaction, so a failed recalculation
# rolls the settings change back.
settings_updated = Signal()
