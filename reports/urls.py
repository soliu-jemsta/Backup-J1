from django.urls import path

from .views import CompanyStatementView, LandlordStatementView, MarkInvoicePaidView

urlpatterns = [
    path("company-statement/", CompanyStatementView.as_view(), name="company-statement"),
    path("landlord-statement/", LandlordStatementView.as_view(), name="landlord-statement"),
    path("invoices/<int:pk>/mark-paid/", MarkInvoicePaidView.as_view(), name="invoice-mark-paid"),
]
