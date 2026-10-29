from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Sum
from django.utils import timezone


class Invoice(models.Model):

    # ==========================================
    # Invoice type
    # ==========================================
    # Holding Deposit        - tenant secures a property pre-tenancy
    # Remittance & Invoice   - payment to landlord after rent received;
    #   Statement              includes management fee + any project work
    #                          deducted from rent as line items
    # Landlord Invoice       - maintenance/work billed to landlord directly,
    #                          NOT deducted from rent
    # Tenant Invoice         - every payment received from a tenant

    TYPE_HOLDING_DEPOSIT = "holding_deposit"
    TYPE_REMITTANCE_STATEMENT = "remittance_statement"
    TYPE_LANDLORD_INVOICE = "landlord_invoice"
    TYPE_TENANT_INVOICE = "tenant_invoice"

    INVOICE_TYPE_CHOICES = [
        (TYPE_HOLDING_DEPOSIT, "Holding Deposit"),
        (TYPE_REMITTANCE_STATEMENT, "Remittance & Invoice Statement"),
        (TYPE_LANDLORD_INVOICE, "Landlord Invoice"),
        (TYPE_TENANT_INVOICE, "Tenant Invoice"),
    ]

    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_OVERDUE = "overdue"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_PAID, "Paid"),
        (STATUS_OVERDUE, "Overdue"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    invoice_type = models.CharField(
        max_length=25,
        choices=INVOICE_TYPE_CHOICES,
        default=TYPE_LANDLORD_INVOICE,
    )

    # ==========================================
    # Relationships
    # ==========================================

    landlord = models.ForeignKey(
        "landlords.Landlord",
        on_delete=models.CASCADE,
        related_name="invoices",
    )

    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.CASCADE,
        related_name="invoices",
    )

    tenancy = models.ForeignKey(
        "tenants.Tenancy",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoices",
    )

    project = models.ForeignKey(
        "projects.Project",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoices",
        help_text=(
            "Only set for a Landlord Invoice billing a single project directly. "
            "Remittance & Invoice Statements should leave this blank and link "
            "projects via InvoiceItem.project instead, since one statement can "
            "cover several projects' deducted work in a single period."
        ),
    )

    # ==========================================
    # Invoice Period (Rent Statements)
    # ==========================================

    from_date = models.DateField(null=True, blank=True)
    to_date = models.DateField(null=True, blank=True)

    PERIOD_MONTHLY = "monthly"
    PERIOD_QUARTERLY = "quarterly"
    PERIOD_ANNUALLY = "annually"

    PERIOD_TYPE_CHOICES = [
        (PERIOD_MONTHLY, "Monthly"),
        (PERIOD_QUARTERLY, "Quarterly"),
        (PERIOD_ANNUALLY, "Annually"),
    ]

    period_type = models.CharField(
        max_length=20,
        choices=PERIOD_TYPE_CHOICES,
        null=True,
        blank=True,
    )
    period_year = models.IntegerField(null=True, blank=True)
    sub_period = models.CharField(max_length=20, null=True, blank=True)

    rent_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"),
        help_text="Monthly base rent",
    )
    total_rent = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"),
        help_text="Rent multiplied by billing period",
    )
    total_disbursements = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"),
    )
    completed_project_ids = models.JSONField(
        blank=True, default=list, help_text="Example: [3, 7]"
    )

    # ==========================================
    # Totals (Calculated)
    # ==========================================

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
    )

    vat_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
    )

    vat_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
    )

    amount_payable = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
    )

    # ==========================================
    # Metadata
    # ==========================================

    invoice_ref = models.CharField(
        max_length=100,
        unique=True,
    )

    plan = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    version = models.PositiveIntegerField(default=1)

    supersedes = models.OneToOneField(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="superseded_by",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    due_date = models.DateField(
        null=True,
        blank=True,
    )

    # Date the payment was actually received. Entered by the user from the
    # financial reports section when marking an invoice as paid. Needed for
    # cash-basis reporting; use mark_paid() so status and paid_at stay in sync.
    paid_at = models.DateField(
        null=True,
        blank=True,
        help_text="Date payment was received. Only set when status is Paid.",
    )

    # Remittance statements only: the user confirms the rent received from the
    # bank before the statement is created. total_rent holds the confirmed
    # figure; these two record when it landed and who confirmed it.
    rent_received_on = models.DateField(null=True, blank=True)
    rent_confirmed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="confirmed_statements",
    )

    file = models.FileField(
        upload_to="invoices/",
        blank=True,
        null=True,
    )

    # ==========================================
    # Locking
    # ==========================================

    is_locked = models.BooleanField(
        default=False,
        editable=False,
    )

    locked_at = models.DateTimeField(
        null=True,
        blank=True,
        editable=False,
    )

    MUTABLE_AFTER_LOCK = {
        "status",
        "file",
        "due_date",
        "paid_at",
    }

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.invoice_ref

    def clean(self):

        if self.invoice_type == self.TYPE_LANDLORD_INVOICE:
            if not self.project:
                raise ValidationError(
                    "Landlord invoices must reference a project."
                )
            if self.project.deduct_from_rent:
                raise ValidationError(
                    "This project is set to deduct from rent and belongs in a "
                    "Remittance & Invoice Statement, not a standalone Landlord Invoice."
                )

        elif self.invoice_type == self.TYPE_REMITTANCE_STATEMENT:
            if self.project:
                raise ValidationError(
                    "Remittance & Invoice Statements cannot reference a single "
                    "project directly — link projects via InvoiceItem.project instead."
                )

        elif self.invoice_type in (self.TYPE_HOLDING_DEPOSIT, self.TYPE_TENANT_INVOICE):
            if self.project:
                raise ValidationError(
                    f"{self.get_invoice_type_display()} invoices cannot reference a project."
                )
            if not self.tenancy:
                raise ValidationError(
                    f"{self.get_invoice_type_display()} invoices must reference a tenancy."
                )

        # A payment date only makes sense on a paid invoice. The reverse is
        # deliberately NOT enforced, so invoices already marked paid before
        # paid_at existed can still be saved (they show up as "date missing").
        if self.paid_at and self.status != self.STATUS_PAID:
            raise ValidationError(
                "A payment date can only be set on an invoice with status Paid."
            )

    def save(self, *args, **kwargs):

        self.full_clean()

        if self.pk:

            original = Invoice.objects.get(pk=self.pk)

            if original.is_locked:

                changed = {
                    field.name
                    for field in self._meta.fields
                    if getattr(original, field.name) != getattr(self, field.name)
                }

                disallowed = changed - self.MUTABLE_AFTER_LOCK

                if disallowed:
                    raise ValidationError(
                        f"Invoice '{self.invoice_ref}' is locked and cannot be modified."
                    )

        else:
            self.is_locked = True
            self.locked_at = timezone.now()

        super().save(*args, **kwargs)

    def mark_paid(self, paid_at):
        """
        Mark this invoice as paid on the given date. Sets status and paid_at
        together so they can never disagree. Both are mutable after locking.
        """
        if self.status == self.STATUS_CANCELLED:
            raise ValidationError("A cancelled invoice cannot be marked as paid.")
        if paid_at is None:
            raise ValidationError("A payment date is required.")

        self.status = self.STATUS_PAID
        self.paid_at = paid_at
        self.save()

    def recalculate_totals(self):

        totals = self.items.aggregate(
            subtotal=Sum("subtotal"),
            vat=Sum("vat_amount"),
            total=Sum("line_total"),
        )

        self.subtotal = totals["subtotal"] or Decimal("0.00")
        self.vat_fee = totals["vat"] or Decimal("0.00")
        self.amount_payable = totals["total"] or Decimal("0.00")

        first_item = self.items.first()

        self.vat_rate = (
            first_item.vat_rate_snapshot
            if first_item
            else Decimal("0.00")
        )

        super().save(
            update_fields=[
                "subtotal",
                "vat_rate",
                "vat_fee",
                "amount_payable",
            ]
        )

    def create_revision(self, **changes):

        data = {
            field.name: getattr(self, field.name)
            for field in self._meta.fields
            if field.name not in {
                "id",
                "version",
                "supersedes",
                "created_at",
                "locked_at",
                "is_locked",
            }
        }

        data.update(changes)

        # Wrapped so a failure part-way through copying items can't leave a
        # locked, half-built revision behind.
        with transaction.atomic():
            new_invoice = Invoice.objects.create(
                **data,
                version=self.version + 1,
                supersedes=self,
            )

            for item in self.items.all():

                item.pk = None
                item.invoice = new_invoice
                item.save()

        return new_invoice

    @classmethod
    def create_from_project(cls, project, invoice_ref, due_date=None):
        if project.deduct_from_rent:
            raise ValidationError(
                "This project deducts from rent and belongs on a Remittance & "
                "Invoice Statement, not a standalone Landlord Invoice. Generate "
                "the statement from the Rent Statement module instead."
            )

        # Invoices are locked on creation, so the invoice and its line item
        # must be created together or not at all.
        with transaction.atomic():
            invoice = cls.objects.create(
                invoice_type=cls.TYPE_LANDLORD_INVOICE,
                landlord=project.landlord,
                property=project.property,
                project=project,
                invoice_ref=invoice_ref,
                due_date=due_date,
            )

            InvoiceItem.objects.create(
                invoice=invoice,
                project=project,
                description=project.name,
                quantity=Decimal("1.00"),
                unit_price=project.cost,
                maintenance_rate_snapshot=project.maintenance_rate_snapshot or Decimal("0.00"),
                maintenance_fee_snapshot=project.maintenance_fee,
                administration_rate_snapshot=project.admin_rate_snapshot or Decimal("0.00"),
                administration_fee_snapshot=project.admin_fee,
                vat_rate_snapshot=project.vat_rate_snapshot or Decimal("0.00"),
                pass_through_amount=(
                    project.cost if project.cost_is_pass_through else Decimal("0.00")
                ),
            )

        return invoice


class InvoiceItem(models.Model):

    LINE_MANAGEMENT_FEE = "management_fee"
    LINE_TENANT_FIND_FEE = "tenant_find_fee"
    LINE_PROJECT = "project"
    LINE_DEBIT = "debit"
    LINE_CREDIT = "credit"

    LINE_TYPE_CHOICES = [
        (LINE_MANAGEMENT_FEE, "Management fee"),
        (LINE_TENANT_FIND_FEE, "Tenant find fee"),
        (LINE_PROJECT, "Project"),
        (LINE_DEBIT, "Debit"),
        (LINE_CREDIT, "Credit"),
    ]

    line_type = models.CharField(
        max_length=20,
        choices=LINE_TYPE_CHOICES,
        default=LINE_PROJECT,
    )

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="items",
    )

    project = models.ForeignKey(
        "projects.Project",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoice_items",
        help_text=(
            "Set this when the item represents a project's deducted cost on a "
            "Remittance & Invoice Statement, so the project can be traced back "
            "to the statement it was billed through."
        ),
    )

    # Set when the line represents a project debit / credit on a Remittance &
    # Invoice Statement. Same traceability pattern as `project`: a debit or
    # credit counts as "already included" while it sits on a live statement
    # (not cancelled, not superseded). Revisions copy these links automatically.
    debit = models.ForeignKey(
        "projects.ProjectDebit",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoice_items",
    )

    credit = models.ForeignKey(
        "projects.ProjectCredit",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invoice_items",
    )

    description = models.CharField(max_length=255)

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("1.00"),
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    maintenance_rate_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    maintenance_fee_snapshot = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    administration_rate_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    administration_fee_snapshot = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Plan percentage used for a management / tenant-find fee line.
    management_rate_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    vat_rate_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Part of quantity * unit_price that is a pass-through disbursement
    # (e.g. a contractor's VAT-inclusive cost paid on the landlord's behalf).
    # It is included in the totals but excluded from the VAT base, because
    # VAT applies only to Jemsta's own fees.
    pass_through_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    vat_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    line_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    notes = models.TextField(blank=True)

    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def save(self, *args, **kwargs):
        self.subtotal = (
            self.quantity * self.unit_price
        ) + self.maintenance_fee_snapshot + self.administration_fee_snapshot

        vat_base = self.subtotal - self.pass_through_amount

        self.vat_amount = (
            vat_base * self.vat_rate_snapshot / Decimal("100")
        ).quantize(Decimal("0.01"))

        self.line_total = (
            self.subtotal + self.vat_amount
        ).quantize(Decimal("0.01"))

        super().save(*args, **kwargs)

        if self.invoice_id:
            self.invoice.recalculate_totals()

    def __str__(self):
        return self.description
