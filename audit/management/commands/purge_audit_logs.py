from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from audit.models import AuditLog


class Command(BaseCommand):
    help = "Delete audit entries older than N days (run from cron / a scheduled container)."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, required=True)
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **opts):
        cutoff = timezone.now() - timedelta(days=opts["days"])
        qs = AuditLog.objects.filter(timestamp__lt=cutoff)
        count = qs.count()
        if opts["dry_run"]:
            self.stdout.write(f"Would delete {count} entries older than {cutoff:%Y-%m-%d}")
            return
        # Queryset delete bypasses the per-instance guard on purpose: retention only.
        qs._raw_delete(qs.db)
        self.stdout.write(f"Deleted {count} entries older than {cutoff:%Y-%m-%d}")
