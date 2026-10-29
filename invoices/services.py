from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone

from common.constants import PLAN_TENANT_FIND
from invoices.fees import calculate_management_fee
from invoices.models import Invoice, InvoiceItem
from projects.models import FinancialSettings, Project, ProjectCredit, ProjectDebit

ZERO = Decimal("0.00")


# ==========================================================
# Helpers
# ==========================================================

def live_invoices():
    """
    Invoices that currently count: not cancelled and not superseded by a
    revision. A project, debit or credit sitting only on a non-live invoice
    is free to be included again.
    """
    return Invoice.objects.exclude(status=Invoice.STATUS_CANCELLED).filter(
        superseded_by__isnull=True
    )


def generate_statement_ref(landlord, on_date=None):
    """
    {landlord_id}-{initials}-{MMYY}-{sequence}. Skips refs already in use.
    invoice_ref is unique, so a rare race between two simultaneous requests
    surfaces as a validation error rather than a duplicate.
    """
    on_date = on_date or timezone.localdate()
    initials = "".join(part[0].upper() for part in landlord.name.strip().split()[:2])
    prefix = f"{landlord.id}-{initials}-{on_date:%m%y}-"

    n = Invoice.objects.filter(invoice_ref__startswith=prefix).count() + 1
    while Invoice.objects.filter(invoice_ref=f"{prefix}{n:02d}").exists():
        n += 1
    return f"{prefix}{n:02d}"


def attach_pdf(invoice, pdf_bytes):
    """Save the HTML-rendered PDF onto the invoice. `file` stays editable after locking."""
    invoice.file.save(f"{invoice.invoice_ref}.pdf", ContentFile(pdf_bytes), save=True)


# ==========================================================
# What can go on a statement
# ==========================================================

def eligible_statement_lines(landlord, property_obj):
    """
    Returns (projects, debits, credits) that can still be included in a
    Remittance & Invoice Statement for this property. The frontend can use
    this to show what a statement will contain.
    """
    live = live_invoices().values("pk")

    already_projects = InvoiceItem.objects.filter(
        project__isnull=False, invoice__in=live
    ).values("project_id")
    already_debits = InvoiceItem.objects.filter(
        debit__isnull=False, invoice__in=live
    ).values("debit_id")
    already_credits = InvoiceItem.objects.filter(
        credit__isnull=False, invoice__in=live
    ).values("credit_id")

    projects = Project.objects.filter(
        landlord=landlord,
        property=property_obj,
        deduct_from_rent=True,
        status=Project.STATUS_COMPLETED,
        permission_from_landlord=True,
        account_settled=True,
    ).exclude(pk__in=already_projects)

    debits = ProjectDebit.objects.filter(
        project__landlord=landlord,
        project__property=property_obj,
        apply_to_rs=True,
    ).exclude(pk__in=already_debits)

    credits = ProjectCredit.objects.filter(
        project__landlord=landlord,
        project__property=property_obj,
        apply_to_rs=True,
    ).exclude(pk__in=already_credits)

    return projects, debits, credits


def _pick(queryset, ids, label):
    """All eligible rows when ids is None; otherwise ids must all be eligible."""
    if ids is None:
        return list(queryset)
    ids = set(ids)
    rows = list(queryset.filter(pk__in=ids))
    missing = ids - {row.pk for row in rows}
    if missing:
        raise ValidationError(
            f"{label} {sorted(missing)} cannot be included in this statement "
            f"(not eligible, or already on a live statement)."
        )
    return rows


# ==========================================================
# Line specs (plain dicts of InvoiceItem fields)
# ==========================================================

def _fee_line(landlord, property_obj, rent_received, vat_rate):
    plan = landlord.plan

    if plan == PLAN_TENANT_FIND:
        # One-time fee: skip if a live statement for this property already has it.
        already_charged = InvoiceItem.objects.filter(
            line_type=InvoiceItem.LINE_TENANT_FIND_FEE,
            invoice__in=live_invoices().filter(property=property_obj),
        ).exists()
        if already_charged:
            return None

    result = calculate_management_fee(
        plan, rent_received, monthly_rent=property_obj.rent_amount
    )
    if result["fee"] <= ZERO:
        return None

    return {
        "line_type": (
            InvoiceItem.LINE_TENANT_FIND_FEE
            if result["is_one_time"]
            else InvoiceItem.LINE_MANAGEMENT_FEE
        ),
        "description": result["label"],
        "unit_price": result["fee"],
        "management_rate_snapshot": result["rate"],
        "vat_rate_snapshot": vat_rate,
        "pass_through_amount": ZERO,
    }


def _project_line(project):
    return {
        "line_type": InvoiceItem.LINE_PROJECT,
        "project": project,
        "description": project.name,
        "unit_price": project.cost,
        "maintenance_rate_snapshot": project.maintenance_rate_snapshot or ZERO,
        "maintenance_fee_snapshot": project.maintenance_fee,
        "administration_rate_snapshot": project.admin_rate_snapshot or ZERO,
        "administration_fee_snapshot": project.admin_fee,
        "vat_rate_snapshot": project.vat_rate_snapshot or ZERO,
        "pass_through_amount": project.cost if project.cost_is_pass_through else ZERO,
    }


def _debit_line(debit, vat_rate):
    # The debit amount passes through; only its admin fee carries VAT.
    return {
        "line_type": InvoiceItem.LINE_DEBIT,
        "debit": debit,
        "project": debit.project,
        "description": f"Debit: {debit.reason_for_debit}",
        "unit_price": debit.amount,
        "administration_rate_snapshot": debit.admin_rate_snapshot or ZERO,
        "administration_fee_snapshot": debit.admin_fee,
        "vat_rate_snapshot": vat_rate,
        "pass_through_amount": debit.amount,
    }


def _credit_line(credit, vat_rate):
    # Negative pass-through: reduces what is deducted, no VAT.
    return {
        "line_type": InvoiceItem.LINE_CREDIT,
        "credit": credit,
        "project": credit.project,
        "description": f"Credit: {credit.reason_for_credit}",
        "unit_price": -credit.amount,
        "vat_rate_snapshot": vat_rate,
        "pass_through_amount": -credit.amount,
    }


# ==========================================================
# Create a Remittance & Invoice Statement
# ==========================================================

@transaction.atomic
def create_remittance_statement(
    *,
    landlord,
    property_obj,
    rent_received,
    rent_received_on,
    confirmed_by,
    from_date,
    to_date,
    period_type=None,
    period_year=None,
    sub_period=None,
    invoice_ref=None,
    due_date=None,
    project_ids=None,
    debit_ids=None,
    credit_ids=None,
):
    """
    Build a locked Remittance & Invoice Statement from the rent the user has
    confirmed against the bank, plus the landlord's plan fee and any eligible
    deducted projects, debits and credits. Everything is created together or
    not at all.

    Pass project_ids / debit_ids / credit_ids to include a subset; leave them
    as None to include everything eligible.
    """
    if property_obj.landlord_id != landlord.id:
        raise ValidationError("Property does not belong to this landlord.")
    if rent_received is None or rent_received < ZERO:
        raise ValidationError("Confirmed rent received is required.")
    if rent_received_on is None:
        raise ValidationError("The date the rent was received is required.")
    if confirmed_by is None:
        raise ValidationError("Who confirmed the rent is required.")

    vat_rate = FinancialSettings.load().vat_rate

    eligible_projects, eligible_debits, eligible_credits = eligible_statement_lines(
        landlord, property_obj
    )
    projects = _pick(eligible_projects, project_ids, "Projects")
    debits = _pick(eligible_debits, debit_ids, "Debits")
    credits = _pick(eligible_credits, credit_ids, "Credits")

    # Build every line first so total_disbursements is known before the
    # invoice is created (invoices lock on creation).
    lines = []
    fee_line = _fee_line(landlord, property_obj, rent_received, vat_rate)
    if fee_line:
        lines.append(fee_line)
    lines += [_project_line(p) for p in projects]
    lines += [_debit_line(d, vat_rate) for d in debits]
    lines += [_credit_line(c, vat_rate) for c in credits]

    if not lines:
        raise ValidationError("There is nothing to include in this statement.")

    total_disbursements = sum((line["pass_through_amount"] for line in lines), ZERO)
    tenancy = property_obj.tenancies.filter(is_active=True).first()

    invoice = Invoice.objects.create(
        invoice_type=Invoice.TYPE_REMITTANCE_STATEMENT,
        landlord=landlord,
        property=property_obj,
        tenancy=tenancy,
        from_date=from_date,
        to_date=to_date,
        period_type=period_type,
        period_year=period_year,
        sub_period=sub_period,
        rent_amount=property_obj.rent_amount,
        total_rent=rent_received,
        total_disbursements=total_disbursements,
        completed_project_ids=[p.pk for p in projects],
        plan=landlord.plan,
        invoice_ref=invoice_ref or generate_statement_ref(landlord),
        due_date=due_date,
        rent_received_on=rent_received_on,
        rent_confirmed_by=confirmed_by,
    )

    for order, line in enumerate(lines):
        InvoiceItem.objects.create(invoice=invoice, display_order=order, **line)

    invoice.refresh_from_db()
    return invoice


# ==========================================================
# Statement summary (also reusable by the reports)
# ==========================================================

def remittance_summary(invoice):
    """
    How a statement breaks down. amount_payable is the sum of line totals, so
    it is everything deducted from the rent (fees + VAT + pass-through costs,
    less credits). The landlord receives what is left.
    """
    pass_through = invoice.total_disbursements
    return {
        "rent_received": invoice.total_rent,
        "company_fees": invoice.subtotal - pass_through,
        "vat_on_fees": invoice.vat_fee,
        "pass_through_costs": pass_through,
        "total_deducted": invoice.amount_payable,
        "net_to_landlord": invoice.total_rent - invoice.amount_payable,
    }
