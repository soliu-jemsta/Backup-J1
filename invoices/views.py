from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Invoice
from .serializers import InvoiceSerializer, InvoiceRevisionSerializer
from Users.permissions import AuthenticatedExceptOptions


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    Read-only invoice endpoint.

    Project invoices are created from the Project module.
    Rent statement invoices are created from the Rent Statement module.

    This endpoint is responsible for viewing invoices and creating
    revisions only.
    """

    queryset = Invoice.objects.all().order_by("-created_at")
    serializer_class = InvoiceSerializer
    permission_classes = [AuthenticatedExceptOptions]

    http_method_names = ["get", "head", "options", "post"]

    def create(self, request):
        return Response(
            {
                "detail": (
                    "Invoices cannot be created directly. "
                    "Generate them from a Project or Rent Statement."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def update(self, request, *args, **kwargs):
        return Response(
            {
                "detail": (
                    "Invoices are immutable. "
                    "Create a revision instead."
                )
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    partial_update = update

    def destroy(self, request, *args, **kwargs):
        return Response(
            {
                "detail": "Invoices cannot be deleted."
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["post"])
    def revise(self, request, pk=None):

        invoice = get_object_or_404(Invoice, pk=pk)

        input_serializer = InvoiceRevisionSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            new_invoice = invoice.create_revision(**input_serializer.validated_data)

        except DjangoValidationError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(new_invoice)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )