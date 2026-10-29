from rest_framework.permissions import BasePermission


class CanViewAuditLog(BasePermission):
    """Superusers, or anyone granted the Django permission 'audit | audit log |
    Can view audit log' (assign it to a Group in the admin)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_superuser or user.has_perm("audit.view_auditlog"))
        )
