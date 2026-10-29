from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from invoices.models import Invoice
from landlords.models import Landlord

from . import services
from .permissions import IsFinanceUser
from .serializers import (
    CompanyStatementQuerySerializer,
    LandlordStatementQuerySerializer,
    MarkPaidSerializer,
)


class CompanyStatementView(APIView):
    """GET /reports/company-statement/?date_from=&date_to=&basis=invoice|cash"""

    permission_classes = [IsFinanceUser]

    def get(self, request):
        query = CompanyStatementQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = query.validated_data
        return Response(
            services.company_statement(data["date_from"], data["date_to"], data["basis"])
        )


class LandlordStatementView(APIView):
    """GET /reports/landlord-statement/?landlord=<id>&date_from=&date_to=&property=<id>"""

    permission_classes = [IsFinanceUser]

    def get(self, request):
        query = LandlordStatementQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = query.validated_data
        landlord = get_object_or_404(Landlord, pk=data["landlord"])
        return Response(
            services.landlord_statement(
                landlord,
                data["date_from"],
                data["date_to"],
                property_id=data.get("property"),
            )
        )


class MarkInvoicePaidView(APIView):
    """POST /reports/invoices/<id>/mark-paid/  body: {"paid_at": "YYYY-MM-DD"}"""

    permission_classes = [IsFinanceUser]

    def post(self, request, pk):
        invoice = get_object_or_404(Invoice, pk=pk)
        body = MarkPaidSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        try:
            invoice.mark_paid(body.validated_data["paid_at"])
        except ValidationError as exc:
            return Response({"detail": exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "id": invoice.id,
                "invoice_ref": invoice.invoice_ref,
                "status": invoice.status,
                "paid_at": invoice.paid_at,
            }
        )
