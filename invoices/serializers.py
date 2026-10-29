from rest_framework import serializers

from .models import Invoice, InvoiceItem

# ==========================================================
# Invoice Item
# ==========================================================

class InvoiceRevisionSerializer(serializers.Serializer):
    """Input serializer for POST /invoices/<id>/revise/ — only these fields may change on a revision."""
    status = serializers.ChoiceField(choices=Invoice.STATUS_CHOICES, required=False)
    due_date = serializers.DateField(required=False, allow_null=True)
    from_date = serializers.DateField(required=False, allow_null=True)
    to_date = serializers.DateField(required=False, allow_null=True)
    plan = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)
    
# ==========================================================
# Invoice Item
# ==========================================================

class InvoiceItemSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    project_type_name = serializers.CharField(
        source="project.project_type.name",
        read_only=True,
    )

    class Meta:
        model = InvoiceItem
        fields = "__all__"


# ==========================================================
# Invoice
# ==========================================================

class InvoiceSerializer(serializers.ModelSerializer):

    items = InvoiceItemSerializer(
        many=True,
        read_only=True,
    )

    landlord_name = serializers.CharField(
        source="landlord.LLName",
        read_only=True,
    )

    property_name = serializers.CharField(
        source="property.name",
        read_only=True,
    )

    tenancy_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = "__all__"

        read_only_fields = (
            "created_at",
            "locked_at",
            "is_locked",
            "version",
            "items",
            "landlord_name",
            "property_name",
            "tenancy_name",
        )

    def get_tenancy_name(self, obj):
        if obj.tenancy:
            return str(obj.tenancy)
        return None
