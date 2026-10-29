from django.contrib import admin
from .models import (
    Project,
    ProjectType,
    FinancialSettings,
    ProjectDebit,
    ProjectCredit,
)


@admin.register(ProjectType)
class ProjectTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "fixed_fee", "is_active")
    list_editable = ("fixed_fee", "is_active")
    search_fields = ("name",)


@admin.register(FinancialSettings)
class FinancialSettingsAdmin(admin.ModelAdmin):
    list_display = ("vat_rate",)

    def has_add_permission(self, request):
        # Singleton row only - block adding more once one exists
        return not FinancialSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


class ProjectDebitInline(admin.TabularInline):
    model = ProjectDebit
    extra = 0
    fields = ("date_of_debit", "amount", "reason_for_debit", "apply_to_rs", "apply_admin_fees", "amount_added_to_rs")


class ProjectCreditInline(admin.TabularInline):
    model = ProjectCredit
    extra = 0
    fields = ("date_of_credit", "amount", "reason_for_credit", "apply_to_rs", "amount_added_to_rs")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "landlord",
        "property",
        "project_type",
        "invoice_number",
        "cost",
        "total",
        "invoice_route_display",
        "permission_from_landlord",
        "account_settled",
        "status",
        "created_at",
    )
    list_filter = (
        "status",
        "project_type",
        "permission_from_landlord",
        "account_settled",
        "apply_maintenance_fee",
        "deduct_from_rent",
    )
    search_fields = ("name", "invoice_number", "landlord__name", "property__address")
    autocomplete_fields = ("landlord", "property", "project_type")
    readonly_fields = (
        "maintenance_fee",
        "admin_fee",
        "vat_amount",
        "total",
        "amount_added_to_remittance",
        "created_at",
        "invoice_route_display",
    )

    fieldsets = (
        ("Basic Info", {
            "fields": ("name", "description", "landlord", "property", "project_type", "invoice_number", "status")
        }),
        ("Dates", {
            "fields": ("start_date", "end_date")
        }),
        ("Approval & Settlement", {
            "fields": ("permission_from_landlord", "account_settled")
        }),
        ("Cost & Maintenance Rate", {
            "fields": ("cost", "apply_maintenance_fee", "maintenance_rate_snapshot", "maintenance_fee")
        }),
        ("Administration Fee", {
            "fields": ("admin_rate_snapshot", "admin_fee")
        }),
        ("VAT & Total", {
            "fields": ("vat_rate_snapshot", "vat_amount", "total")
        }),
        ("Remittance", {
            "fields": ("deduct_from_rent", "amount_added_to_remittance", "business_income", "invoice_route_display")
        }),
        ("Meta", {
            "fields": ("created_at",)
        }),
    )

    inlines = [ProjectDebitInline, ProjectCreditInline]

    @admin.display(description="Invoice Route")
    def invoice_route_display(self, obj):
        return (
            "Remittance & Invoice Statement"
            if obj.deduct_from_rent
            else "Landlord Invoice"
        )


@admin.register(ProjectDebit)
class ProjectDebitAdmin(admin.ModelAdmin):
    list_display = ("project", "date_of_debit", "amount", "reason_for_debit", "apply_to_rs", "apply_admin_fees")
    list_filter = ("apply_to_rs", "apply_admin_fees")
    search_fields = ("project__name", "reason_for_debit")


@admin.register(ProjectCredit)
class ProjectCreditAdmin(admin.ModelAdmin):
    list_display = ("project", "date_of_credit", "amount", "reason_for_credit", "apply_to_rs")
    list_filter = ("apply_to_rs",)
    search_fields = ("project__name", "reason_for_credit")
