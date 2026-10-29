import contextvars

_ctx = contextvars.ContextVar("audit_ctx", default=None)


def set_context(**kwargs):
    data = dict(_ctx.get() or {})
    data.update(kwargs)
    _ctx.set(data)


def get_context():
    return _ctx.get() or {}


def clear_context():
    _ctx.set(None)