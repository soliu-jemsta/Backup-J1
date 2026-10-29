from rest_framework import serializers

from .models import AuditLog


class _Base(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    model = serializers.SerializerMethodField()
    model_name = serializers.SerializerMethodField()
    changed_fields = serializers.SerializerMethodField()

    def get_actor(self, obj):
        if not obj.actor_id and not obj.actor_email:
            return None  # system / shell / migration
        return {"id": obj.actor_id, "email": obj.actor_email, "role": obj.actor_role}

    def get_model(self, obj):
        ct = obj.content_type
        return f"{ct.app_label}.{ct.model}" if ct else None

    def get_model_name(self, obj):
        ct = obj.content_type
        cls = ct.model_class() if ct else None
        return str(cls._meta.verbose_name).title() if cls else (ct.model if ct else None)

    def get_changed_fields(self, obj):
        return list((obj.changes or {}).keys())


class AuditLogListSerializer(_Base):
    class Meta:
        model = AuditLog
        fields = ["id", "timestamp", "action", "actor", "model", "model_name",
                  "object_id", "object_repr", "changed_fields", "ip_address"]
        read_only_fields = fields


class AuditLogDetailSerializer(_Base):
    class Meta:
        model = AuditLog
        fields = ["id", "timestamp", "action", "actor", "model", "model_name",
                  "object_id", "object_repr", "changed_fields", "changes", "metadata",
                  "ip_address", "user_agent", "method", "path", "request_id"]
        read_only_fields = fields
