import re
from datetime import datetime, time, timedelta

from django.apps import apps
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import AuditLog
from .permissions import CanViewAuditLog
from .serializers import AuditLogDetailSerializer, AuditLogListSerializer

_DATE_ONLY = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class AuditLogPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


def _parse_bound(value, field, end=False):
    """Accepts YYYY-MM-DD or a full ISO datetime. A plain date used as an upper
    bound means 'through the end of that day'. Returns (datetime, exclusive)."""
    msg = {field: "Use YYYY-MM-DD or an ISO 8601 datetime."}
    try:
        if _DATE_ONLY.match(value):
            d = parse_date(value)
            if d is None:
                raise ValueError
            dt = datetime.combine(d, time.min)
            exclusive = end
            if end:
                dt += timedelta(days=1)
        else:
            dt = parse_datetime(value)
            if dt is None:
                raise ValueError
            exclusive = False
    except ValueError:
        raise ValidationError(msg)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    return dt, exclusive


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [CanViewAuditLog]
    pagination_class = AuditLogPagination
    filter_backends = []  # filtering is done explicitly below

    def get_serializer_class(self):
        return AuditLogDetailSerializer if self.action == "retrieve" else AuditLogListSerializer

    def get_queryset(self):
        qs = AuditLog.objects.select_related("content_type")
        p = self.request.query_params

        if p.get("action"):
            qs = qs.filter(action__in=[a.strip() for a in p["action"].split(",") if a.strip()])
        if p.get("actor"):
            qs = qs.filter(actor_id=p["actor"])
        if p.get("actor_email"):
            qs = qs.filter(actor_email__icontains=p["actor_email"])
        if p.get("model"):
            if "." in p["model"]:
                app_label, model = p["model"].split(".", 1)
                qs = qs.filter(content_type__app_label__iexact=app_label, content_type__model__iexact=model)
            else:
                qs = qs.filter(content_type__model__iexact=p["model"])
        if p.get("object_id"):
            qs = qs.filter(object_id=p["object_id"])
        if p.get("request_id"):
            qs = qs.filter(request_id=p["request_id"])
        if p.get("ip_address"):
            qs = qs.filter(ip_address=p["ip_address"])
        if p.get("date_from"):
            start, _ = _parse_bound(p["date_from"], "date_from")
            qs = qs.filter(timestamp__gte=start)
        if p.get("date_to"):
            end, exclusive = _parse_bound(p["date_to"], "date_to", end=True)
            qs = qs.filter(timestamp__lt=end) if exclusive else qs.filter(timestamp__lte=end)
        if p.get("q"):
            q = p["q"]
            qs = qs.filter(
                Q(object_repr__icontains=q) | Q(actor_email__icontains=q)
                | Q(object_id=q) | Q(request_id=q)
            )

        ordering = p.get("ordering", "-timestamp")
        if ordering not in ("timestamp", "-timestamp"):
            raise ValidationError({"ordering": "Use 'timestamp' or '-timestamp'."})
        return qs.order_by(ordering)

    @action(detail=False, methods=["get"])
    def filters(self, request):
        """Options for filter dropdowns."""
        models = []
        for label in getattr(settings, "AUDITED_MODELS", {}):
            try:
                m = apps.get_model(label)
            except LookupError:
                continue
            models.append({
                "value": f"{m._meta.app_label}.{m._meta.model_name}",
                "label": str(m._meta.verbose_name).title(),
            })
        return Response({
            "actions": [{"value": v, "label": l} for v, l in AuditLog.Action.choices],
            "models": sorted(models, key=lambda x: x["label"]),
        })
