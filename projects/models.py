from decimal import Decimal

from django.db import models
from django.core.exceptions import ValidationError
from builtins import property as builtin_property
from comments.models import Comment
from django.contrib.contenttypes.fields import GenericRelation


class ProjectType(models.Model):
    """
    Editable lookup table for fixed-fee project types
    (GSC, ECIR, EPC, Tenancy Setup Fee, Rent Protection, etc).
    Manage from the frontend/admin instead of hardcoding fees in code.
    """
    name = models.CharField(max_length=100, unique=True)
    fixed_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} (£{self.fixed_fee})"


class FinancialSettings(models.Model):
    """
    Singleton settings row for finance-wide constants (e.g. VAT rate),
    editable the same way as ProjectType rather than hardcoded in code.
    """
    vat_rate = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal("20.00"),
        help_text="VAT rate as a percentage, e.g. 20.00 for 20%"
    )

    class Meta:
        verbose_name = "Financial Settings"
        verbose_name_plural = "Financial Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Singleton row - hard block deletion regardless of caller
        # (admin, shell, management command, signal, etc.)
        raise ValidationError(
            "Financial Settings is a singleton and cannot be deleted."
        )

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"Financial Settings (VAT {self.vat_rate}%)"


class Project(models.Model):
    STATUS_INCOMPLETE = "incomplete"
    STATUS_PENDING = "pending"
    STATUS_COMPLETED = "completed"

    STATUS_CHOICES = [
        (STATUS_INCOMPLETE, "Incomplete"),   # 0%   -> red
        (STATUS_PENDING, "Pending"),          # 50%+ -> amber
        (STATUS_COMPLETED, "Completed"),      # 100% -> green
    ]

    COMPLETION_PERCENTAGE = {
        STATUS_INCOMPLETE: 0,
        STATUS_PENDING: 50,
        STATUS_COMPLETED: 100,
    }

    TRAFFIC_LIGHT = {
        STATUS_INCOMPLETE: "red",
        STATUS_PENDING: "amber",
        STATUS_COMPLETED: "green",
    }

    # Financial fields that must not change once this project's cost has
    # flowed into a locked invoice (either a standalone Landlord Invoice,
    # or as a line item on a locked Remittance & Invoice Statement).
    LOCKED_AFTER_INVOICE_FIELDS = {
        "cost",
        "cost_is_pass_through",
        "apply_maintenance_fee",
        "maintenance_rate_snapshot",
        "maintenance_fee",
        "admin_fee",
        "admin_rate_snapshot",
        "vat_rate_snapshot",
        "vat_amount",
        "total",
        "deduct_from_rent",
        "amount_added_to_remittance",
    }

    comments = GenericRelation(Comment)

    landlord = models.ForeignKey("landlords.Landlord", on_delete=models.CASCADE, related_name="projects")
    property = models.ForeignKey("properties.Property", on_delete=models.CASCADE, related_name="projects")
    project_type = models.ForeignKey(
        ProjectType, on_delete=models.PROTECT, related_name="projects",
        null=True, blank=True,
        help_text="Pick a fixed-fee type (GSC, ECIR, EPC, Tenancy Setup, Rent Protection) or leave blank for a custom project."
    )

    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    invoice_number = models.CharField(max_length=100, null=True, blank=True)

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    permission_from_landlord = models.BooleanField(
        default=False,
        help_text="Remittance can only be generated when this is True."
    )

    cost = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"),
        help_text="Defaults to the project type's fixed fee if left unset; editable for custom projects."
    )

    cost_is_pass_through = models.BooleanField(
        default=False,
        help_text=(
            "True when cost is a contractor cost paid on the landlord's behalf "
            "(VAT-inclusive). VAT is then charged only on Jemsta's fees, not on the cost."
        ),
    )

    apply_maintenance_fee = models.BooleanField(default=False)

    maintenance_rate_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maintenance rate (%) copied from the Property when the project is created."
    )

    maintenance_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
    )

    admin_rate_snapshot = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=(
            "admin rate (%) copied from the Property at save time — "
            "the fixed rate charged for handling this project, constant regardless "
            "of the rent amount."
        ),
    )

    admin_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        editable=False,
    )

    vat_rate_snapshot = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="VAT rate (%) copied from FinancialSettings at save time."
    )
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False)

    deduct_from_rent = models.BooleanField(
        default=False,
        help_text=(
            "If True, this project's cost is folded into the tenant/landlord's "
            "Remittance & Invoice Statement as a line item instead of being "
            "billed as a standalone Landlord Invoice."
        ),
    )
    amount_added_to_remittance = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False
    )

    business_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    account_settled = models.BooleanField(
        default=False,
        help_text="Remittance can only be generated when this is True."
    )

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_INCOMPLETE
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    def clean(self):
        if self.project_type_id and not self.cost:
            self.cost = self.project_type.fixed_fee

    def has_locked_invoice(self):
        """
        True if this project's charges already live inside a locked invoice,
        whichever channel that ended up being:
          - a standalone Landlord Invoice referencing this project directly, or
          - a Remittance & Invoice Statement that includes an InvoiceItem
            linked to this project.
        Local import avoids a circular import between the projects and
        invoices apps.
        """
        from invoices.models import InvoiceItem

        if self.invoices.filter(is_locked=True).exists():
            return True

        return InvoiceItem.objects.filter(
            project=self, invoice__is_locked=True
        ).exists()

    def invoice_route(self):
        """
        Which invoice channel this project's cost is meant to flow into,
        based on whether the landlord has given permission to deduct from rent.
        """
        return "remittance_statement" if self.deduct_from_rent else "landlord_invoice"

    def save(self, *args, **kwargs):
        # Block edits to financial fields once this project's cost has
        # already flowed into a locked invoice. Non-financial fields
        # (status, description, dates, etc.) stay editable regardless.
        if self.pk and self.has_locked_invoice():
            original = Project.objects.get(pk=self.pk)
            changed = {
                field.name
                for field in self._meta.fields
                if getattr(original, field.name) != getattr(self, field.name)
            }
            disallowed = changed & self.LOCKED_AFTER_INVOICE_FIELDS
            if disallowed:
                raise ValidationError(
                    f"Cannot modify {', '.join(sorted(disallowed))} — "
                    f"this project has a locked invoice."
                )

        # Default cost from project type's fixed fee, if not already set
        if self.project_type_id and (self.cost is None or self.cost == 0):
            self.cost = self.project_type.fixed_fee

        # Maintenance fee
        if self.apply_maintenance_fee and self.property_id:
            self.maintenance_rate_snapshot = self.property.maintenance_rate

        if self.apply_maintenance_fee and self.maintenance_rate_snapshot:
            self.maintenance_fee = (
                self.cost * self.maintenance_rate_snapshot / Decimal("100")
            ).quantize(Decimal("0.01"))
        else:
            self.maintenance_fee = Decimal("0.00")

        # admin fee — fixed handling rate for this project, snapshotted
        # from the Property. Constant regardless of rent amount, so unlike
        # maintenance_fee it isn't gated behind an apply_* toggle: every project
        # is charged for handling.
        if self.property_id:
            self.admin_rate_snapshot = self.property.administration_rate

        if self.admin_rate_snapshot:
            self.admin_fee = (
                self.cost * self.admin_rate_snapshot / Decimal("100")
            ).quantize(Decimal("0.01"))
        else:
            self.admin_fee = Decimal("0.00")

        # VAT: a pass-through contractor cost already includes the contractor's
        # VAT and is paid on the landlord's behalf, so VAT applies only to
        # Jemsta's own fees. Any other cost (e.g. a fixed-fee project) is
        # Jemsta's own charge, so VAT applies to the whole subtotal.
        settings_obj = FinancialSettings.load()
        self.vat_rate_snapshot = settings_obj.vat_rate
        subtotal = self.cost + self.maintenance_fee + self.admin_fee
        vat_base = (
            self.maintenance_fee + self.admin_fee
            if self.cost_is_pass_through else subtotal
        )
        self.vat_amount = (vat_base * self.vat_rate_snapshot / Decimal("100")).quantize(Decimal("0.01"))

        # Total = cost + maintenance_fee + admin_fee + VAT
        self.total = (subtotal + self.vat_amount).quantize(Decimal("0.01"))

        # Amount added to remittance: only relevant if flagged to be deducted from rent
        self.amount_added_to_remittance = self.total if self.deduct_from_rent else Decimal("0.00")

        super().save(*args, **kwargs)

    def can_generate_remittance(self):
        return self.permission_from_landlord and self.account_settled

    @builtin_property
    def completion_percentage(self):
        return self.COMPLETION_PERCENTAGE.get(self.status, 0)

    @builtin_property
    def traffic_light(self):
        return self.TRAFFIC_LIGHT.get(self.status, "red")

    def can_generate_invoice(self):
        # Mirrors can_generate_remittance — invoice generation only
        # allowed once the project is actually marked done.
        return self.status == self.STATUS_COMPLETED


class ProjectImage(models.Model):

    STAGE_CHOICES = [
        ('before', 'Before'),
        ('after', 'After'),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="project_images/%Y/%m/")
    caption = models.CharField(max_length=255, null=True, blank=True)
    stage = models.CharField(
        max_length=10,
        choices=STAGE_CHOICES,
        null=True,
        blank=True,
        help_text="Mark whether this image was taken before or after the project work."
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="Marks the thumbnail/cover image shown in project lists."
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "stage", "-uploaded_at"]

    def save(self, *args, **kwargs):
        # Only one primary image per project
        if self.is_primary:
            ProjectImage.objects.filter(
                project=self.project, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        stage_label = f" ({self.get_stage_display()})" if self.stage else ""
        return f"Image for {self.project.name}{stage_label}"


class ProjectDebit(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="debits")

    date_of_debit = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason_for_debit = models.CharField(max_length=255)
    apply_to_rs = models.BooleanField(default=False, help_text="Apply to Rent Statement / Remittance Statement.")
    apply_admin_fees = models.BooleanField(default=False)

    # NOTE: assumes Property has a percentage field named `admin_rate`
    # (mirroring `maintenance_rate`) — same field Project.save() reads from.
    # Rename here (and in Project.save()) together if the actual field differs.
    admin_rate_snapshot = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="admin rate (%) copied from the Property at save time, so historical debits aren't affected by later rate changes."
    )
    admin_fee = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"), editable=False,
        help_text="Computed admin fee amount for this debit (amount * admin_fee_rate_snapshot / 100)."
    )

    amount_added_to_rs = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        ordering = ["-date_of_debit"]

    def save(self, *args, **kwargs):
        # Snapshot the property's admin rate at save time so it can't
        # drift if the Property's rate changes later. Deliberately independent
        # of Project.admin_rate_snapshot — a debit's admin rate can
        # differ from the project's own rate (e.g. rate changed on Property
        # between when the project was created and when this debit was raised).
        if self.apply_admin_fees and self.project_id:
            self.admin_rate_snapshot = self.project.property.administration_rate

        if self.apply_admin_fees and self.admin_rate_snapshot:
            self.admin_fee = (
                self.amount * self.admin_rate_snapshot / Decimal("100")
            ).quantize(Decimal("0.01"))
        else:
            self.admin_fee = Decimal("0.00")

        # NOTE: assumes the admin fee is added on top of the debit amount
        # when calculating what's deducted from the landlord's rent.
        # Flip to `self.amount - self.admin_fee` if it should
        # instead reduce what's passed through.
        if self.apply_to_rs:
            self.amount_added_to_rs = (self.amount + self.admin_fee).quantize(Decimal("0.01"))
        else:
            self.amount_added_to_rs = Decimal("0.00")

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Debit £{self.amount} - {self.reason_for_debit}"


class ProjectCredit(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="credits")

    date_of_credit = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason_for_credit = models.CharField(max_length=255)
    apply_to_rs = models.BooleanField(default=False, help_text="Apply to Rent Statement / Remittance Statement.")
    amount_added_to_rs = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        ordering = ["-date_of_credit"]

    def save(self, *args, **kwargs):
        # Mirror ProjectDebit: keep amount_added_to_rs in step with the flag,
        # rather than relying on the caller to set it.
        self.amount_added_to_rs = (
            self.amount.quantize(Decimal("0.01")) if self.apply_to_rs else Decimal("0.00")
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Credit £{self.amount} - {self.reason_for_credit}"