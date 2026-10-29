import uuid

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models


class AuditLog(models.Model):
    class Action(models.TextChoices):
        CREATE = "create"
        UPDATE = "update"
        DELETE = "delete"
        LOGIN = "login"
        LOGIN_FAILED = "login_failed"
        OTP_REQUESTED = "otp_requested"
        ACCESS = "access"      # sensitive reads / public API hits
        EXPORT = "export"      # invoice / statement generation
        CUSTOM = "custom"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    # Who. FK is SET_NULL so deleting a user never deletes history; the
    # snapshot fields keep the identity readable afterwards.
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="audit_entries",
    )
    actor_email = models.CharField(max_length=254, blank=True)
    actor_role = models.CharField(max_length=50, blank=True)

    action = models.CharField(max_length=20, choices=Action.choices, db_index=True)

    # What
    content_type = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.SET_NULL)
    object_id = models.CharField(max_length=64, blank=True)
    target = GenericForeignKey("content_type", "object_id")
    object_repr = models.CharField(max_length=255, blank=True)
    changes = models.JSONField(default=dict, blank=True)   # {"field": [old, new]}
    metadata = models.JSONField(default=dict, blank=True)

    # Where / how
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)
    request_id = models.CharField(max_length=64, blank=True, db_index=True)
    method = models.CharField(max_length=10, blank=True)
    path = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["content_type", "object_id", "-timestamp"]),
            models.Index(fields=["actor", "-timestamp"]),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise PermissionError("Audit log entries are immutable.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise PermissionError("Audit log entries cannot be deleted individually.")
