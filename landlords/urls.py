# landlords/urls.py
from rest_framework import routers
from .views import LandlordViewSet

router = routers.DefaultRouter()
router.register(r'', LandlordViewSet, basename='landlord')

urlpatterns = router.urls
