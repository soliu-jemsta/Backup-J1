from rest_framework import routers

from .views import AuditLogViewSet

router = routers.DefaultRouter()
router.register(r"logs", AuditLogViewSet, basename="auditlog")

urlpatterns = router.urls
