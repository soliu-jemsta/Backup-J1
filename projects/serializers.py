# projects/serializers.py

from rest_framework import serializers
from decimal import Decimal
from .models import Project, ProjectType, ProjectImage
from invoices.models import Invoice


class ProjectTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectType
        fields = ["id", "name", "fixed_fee", "is_active"]


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ["id", "project", "image", "caption", "is_primary", "uploaded_at"]
        read_only_fields = ["uploaded_at"]


class ProjectImageUploadSerializer(serializers.ModelSerializer):
    """Used on the nested upload endpoint where project comes from the URL, not the body."""
    class Meta:
        model = ProjectImage
        fields = ["id", "image", "caption", "is_primary", "uploaded_at"]
        read_only_fields = ["uploaded_at"]


class ProjectSerializer(serializers.ModelSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    project_type_detail = ProjectTypeSerializer(source="project_type", read_only=True)
    completion_percentage = serializers.ReadOnlyField()
    traffic_light = serializers.ReadOnlyField()
    has_invoice = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "landlord", "property", "project_type", "project_type_detail",
            "name", "description", "invoice_number", "start_date", "end_date",
            "permission_from_landlord", "cost", "apply_maintenance_fee", "maintenance_rate_snapshot",
            "maintenance_fee", "vat_rate_snapshot", "vat_amount", "total",
            "deduct_from_rent", "amount_added_to_remittance", "business_income",
            "account_settled", "status", "completion_percentage", "traffic_light",
            "created_at", "images", "has_invoice", "admin_rate_snapshot", "admin_fee"
        ]
        read_only_fields = [
            "maintenance_rate_snapshot", "maintenance_fee", "vat_rate_snapshot", "vat_amount", "total",
            "amount_added_to_remittance", "created_at","admin_rate_snapshot", "admin_fee",
        ]

    def get_has_invoice(self, obj):
        return obj.invoices.exists()


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight version for list views — just enough for the traffic-light row."""
    completion_percentage = serializers.ReadOnlyField()
    traffic_light = serializers.ReadOnlyField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "name", "landlord", "property", "status",
            "completion_percentage", "traffic_light", "total", "primary_image",
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image:
            request = self.context.get("request")
            url = img.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class GenerateInvoiceSerializer(serializers.Serializer):
    """Input serializer for POST /projects/<id>/generate-invoice/"""
    invoice_ref = serializers.CharField(max_length=100)
    due_date = serializers.DateField(required=False, allow_null=True)

    def validate_invoice_ref(self, value):
        if Invoice.objects.filter(invoice_ref=value).exists():
            raise serializers.ValidationError("An invoice with this reference already exists.")
        return value
