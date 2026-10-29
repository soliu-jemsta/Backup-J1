from django.contrib.contenttypes.models import ContentType

from .context import get_context
from .models import AuditLog


def log(action, target=None, *, changes=None, metadata=None, actor=None):
    """Explicit audit entry: logins, OTP events, invoice generation, exports..."""
    ctx = get_context()

    actor_id = actor.pk if actor else ctx.get("actor_id")
    actor_email = getattr(actor, "email", "") if actor else ctx.get("actor_email", "")
    actor_role = getattr(actor, "role", "") if actor else ctx.get("actor_role", "")

    # Fallback: session logins (Django admin) and anything the mixin didn't cover.
    if not actor_id:
        user = getattr(ctx.get("request"), "user", None)
        if user is not None and user.is_authenticated:
            actor_id = user.pk
            actor_email = getattr(user, "email", "") or str(user)
            actor_role = getattr(user, "role", "") or ""

    entry = AuditLog(
        action=action,
        changes=changes or {},
        metadata=metadata or {},
        actor_id=actor_id,
        actor_email=actor_email,
        actor_role=actor_role,
        ip_address=ctx.get("ip_address"),
        user_agent=ctx.get("user_agent", ""),
        request_id=ctx.get("request_id", ""),
        method=ctx.get("method", ""),
        path=ctx.get("path", ""),
    )
    if target is not None:
        entry.content_type = ContentType.objects.get_for_model(target, for_concrete_model=False)
        entry.object_id = str(target.pk)
        entry.object_repr = str(target)[:255]
    entry.save()
    return entry
