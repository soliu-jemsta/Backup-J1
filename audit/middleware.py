import uuid

from .context import clear_context, set_context


def _client_ip(request):
    # Behind nginx: make sure nginx sets X-Forwarded-For / X-Real-IP,
    # and only trust it because nginx is the only thing that can reach Django.
    fwd = request.META.get("HTTP_X_FORWARDED_FOR")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class AuditContextMiddleware:
    """Captures request metadata. The actor is resolved at log time from
    request.user, or set earlier by AuditActorMixin for DRF views."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.META.get("HTTP_X_REQUEST_ID") or uuid.uuid4().hex
        set_context(
            request=request,
            request_id=request_id,
            ip_address=_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
            method=request.method,
            path=request.path[:300],
        )
        try:
            response = self.get_response(request)
        finally:
            clear_context()
        response["X-Request-ID"] = request_id
        return response