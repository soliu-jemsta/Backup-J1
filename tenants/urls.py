# tenants/urls.py
from rest_framework import routers
from .views import TenantViewSet, TenancyViewSet

router = routers.DefaultRouter()
router.register(r'tenants', TenantViewSet)
router.register(r'tenancies', TenancyViewSet)
urlpatterns = router.urls
