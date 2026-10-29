from django.apps import apps
from django.conf import settings
from django.db.models.signals import post_delete, post_save, pre_save

from . import services
from .models import AuditLog

# Never write these values to the log.
ALWAYS_EXCLUDE = {"password", "last_login", "otp", "otp_code", "token", "secret"}


def _snapshot(instance, exclude):
    data = {}
    for f in instance._meta.concrete_fields:
        if f.name in exclude or f.name in ALWAYS_EXCLUDE:
            continue
        value = getattr(instance, f.attname)
        data[f.name] = value if isinstance(value, (int, float, bool, type(None), dict, list)) else str(value)
    return data


def _diff(old, new):
    return {k: [old.get(k), v] for k, v in new.items() if old.get(k) != v}


def register_audited_models():
    """settings.AUDITED_MODELS = {"properties.Property": {"exclude": []}, ...}"""
    for label, opts in getattr(settings, "AUDITED_MODELS", {}).items():
        model = apps.get_model(label)
        exclude = set(opts.get("exclude", []))
        uid = f"audit:{label}"

        def pre(sender, instance, _exclude=exclude, **kw):
            instance._audit_old = None
            if instance.pk and not kw.get("raw"):
                old = sender._base_manager.filter(pk=instance.pk).first()
                if old:
                    instance._audit_old = _snapshot(old, _exclude)

        def post(sender, instance, created, _exclude=exclude, **kw):
            if kw.get("raw"):
                return
            new = _snapshot(instance, _exclude)
            if created:
                services.log(AuditLog.Action.CREATE, instance, changes={k: [None, v] for k, v in new.items()})
            else:
                changes = _diff(getattr(instance, "_audit_old", None) or {}, new)
                if changes:
                    services.log(AuditLog.Action.UPDATE, instance, changes=changes)

        def delete(sender, instance, _exclude=exclude, **kw):
            services.log(AuditLog.Action.DELETE, instance, changes={k: [v, None] for k, v in _snapshot(instance, _exclude).items()})

        pre_save.connect(pre, sender=model, weak=False, dispatch_uid=f"{uid}:pre")
        post_save.connect(post, sender=model, weak=False, dispatch_uid=f"{uid}:post")
        post_delete.connect(delete, sender=model, weak=False, dispatch_uid=f"{uid}:del")
