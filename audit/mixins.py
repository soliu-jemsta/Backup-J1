from .context import set_context


class AuditActorMixin:
    """Add to DRF views (or a shared base view) so the authenticated user is
    recorded. initial() runs after authentication, before the handler."""

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        user = request.user
        if user and user.is_authenticated:
            set_context(
                actor_id=user.pk,
                actor_email=getattr(user, "email", "") or str(user),
                actor_role=getattr(user, "role", "") or "",
            )
