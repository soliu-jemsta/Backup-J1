from django.conf import settings
from rest_framework.permissions import BasePermission


class IsFinanceUser(BasePermission):
    """
    Superusers, plus anyone in a group named in settings.FINANCE_REPORT_GROUPS
    (defaults to ["Finance"]). Set that setting to your real group names.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        allowed = getattr(settings, "FINANCE_REPORT_GROUPS", ["Finance"])
        return user.groups.filter(name__in=allowed).exists()
