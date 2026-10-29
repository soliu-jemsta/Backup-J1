from django.urls import path
from .views import PublicSalePropertyListView, PublicPropertyDetailView, PublicRentalPropertyListView

urlpatterns = [
    path("properties/rent/",PublicRentalPropertyListView.as_view(),name="public-rental-properties",),
    path("properties/sale/",PublicSalePropertyListView.as_view(),name="public-sale-properties",
)
]