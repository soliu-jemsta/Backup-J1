# projects/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404

from .models import Project, ProjectType, ProjectImage
from .serializers import (
    ProjectSerializer, ProjectListSerializer, ProjectTypeSerializer,
    ProjectImageSerializer, ProjectImageUploadSerializer, GenerateInvoiceSerializer,
)
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer  # adjust import to your actual path
from Users.permissions import AuthenticatedExceptOptions


class ProjectTypeViewSet(viewsets.ModelViewSet):
    queryset = ProjectType.objects.filter(is_active=True)
    serializer_class = ProjectTypeSerializer
    permission_classes = [AuthenticatedExceptOptions]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related(
        "landlord", "property", "project_type"
    ).prefetch_related("images")
    permission_classes = [AuthenticatedExceptOptions]

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        return ProjectSerializer

    @action(detail=True, methods=["post"], url_path="images")
    def upload_image(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="images")
    def list_images(self, request, pk=None):
        project = self.get_object()
        images = project.images.all()
        serializer = ProjectImageSerializer(images, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="generate-invoice")
    def generate_invoice(self, request, pk=None):
        project = self.get_object()

        if project.invoices.exists():
            return Response(
                {"detail": "This project already has an invoice. "
                           "Use the invoice's revision endpoint instead of generating a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = GenerateInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            invoice = Invoice.create_from_project(
                project,
                invoice_ref=serializer.validated_data["invoice_ref"],
                due_date=serializer.validated_data.get("due_date"),
            )
        except DjangoValidationError as e:
            return Response({"detail": e.messages if hasattr(e, "messages") else str(e)},
                             status=status.HTTP_400_BAD_REQUEST)

        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class ProjectImageViewSet(viewsets.ModelViewSet):
    """Standalone CRUD for images, e.g. for delete/reorder from the frontend gallery UI."""
    queryset = ProjectImage.objects.all()
    serializer_class = ProjectImageSerializer
    permission_classes = [AuthenticatedExceptOptions]

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs