from collections import defaultdict
from decimal import Decimal

from django.db.models import DecimalField, F, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone

from invoices.models import Invoice, InvoiceItem
from invoices.services import live_invoices, remittance_summary

ZERO = Decimal("0.00")
MONEY = DecimalField(max_digits=14, decimal_places=2)

BASIS_INVOICE = "invoice"
BASIS_CASH = "cash"

# Holding deposits and tenant invoices are client money, not company income.
COMPANY_INVOICE_TYPES = [
    Invoice.TYPE_LANDLORD_INVOICE,
    Invoice.TYPE_REMITTANCE_STATEMENT,
]

LINE_TYPE_LABELS = dict(InvoiceItem.LINE_TYPE_CHOICES)


def _sum(expression):
    return Coalesce(
        Sum(expression, output_field=MONEY),
        Value(ZERO, output_field=MONEY),
        output_field=MONEY,
    )


# Net company income on a line is everything except the pass-through part:
#   subtotal - pass_through_amount
# Management/tenant-find fees: the fee. Projects: fees (or the fixed fee if not
# pass-through). Debits: the admin fee only. Credits: zero.
NET_INCOME = F("subtotal") - F("pass_through_amount")


# ==========================================================
# Which invoices fall in a period
# ==========================================================

def company_invoices(date_from, date_to, basis):
    """
    Live landlord invoices and remittance statements for the period.

    invoice basis: counted by issue date (created_at).
    cash basis:    remittance statements by the date the rent was received
                   (fees are taken from rent as it arrives); landlord invoices
                   by paid_at, and only once paid.
    """
    qs = live_invoices().filter(invoice_type__in=COMPANY_INVOICE_TYPES)

    if basis == BASIS_CASH:
        return qs.filter(
            Q(
                invoice_type=Invoice.TYPE_REMITTANCE_STATEMENT,
                rent_received_on__gte=date_from,
                rent_received_on__lte=date_to,
            )
            | Q(
                invoice_type=Invoice.TYPE_LANDLORD_INVOICE,
                status=Invoice.STATUS_PAID,
                paid_at__gte=date_from,
                paid_at__lte=date_to,
            )
        )

    return qs.filter(created_at__date__gte=date_from, created_at__date__lte=date_to)


def _basis_date(invoice, basis):
    if basis == BASIS_CASH:
        if invoice.invoice_type == Invoice.TYPE_REMITTANCE_STATEMENT:
            return invoice.rent_received_on
        return invoice.paid_at
    return timezone.localtime(invoice.created_at).date()


# ==========================================================
# Company financial statement
# ==========================================================

def company_statement(date_from, date_to, basis=BASIS_INVOICE):
    base = company_invoices(date_from, date_to, basis)

    invoices = list(
        base.select_related("landlord").annotate(
            net_fees=_sum(F("items__subtotal") - F("items__pass_through_amount")),
            vat=_sum("items__vat_amount"),
            pass_through=_sum("items__pass_through_amount"),
        )
    )

    total_net = total_vat = total_pass = ZERO
    by_month = defaultdict(lambda: {"net": ZERO, "vat": ZERO})
    by_landlord = defaultdict(lambda: {"net": ZERO, "vat": ZERO, "name": ""})

    for inv in invoices:
        total_net += inv.net_fees
        total_vat += inv.vat
        total_pass += inv.pass_through

        month = _basis_date(inv, basis).strftime("%Y-%m")
        by_month[month]["net"] += inv.net_fees
        by_month[month]["vat"] += inv.vat

        entry = by_landlord[inv.landlord_id]
        entry["name"] = inv.landlord.name
        entry["net"] += inv.net_fees
        entry["vat"] += inv.vat

    line_rows = (
        InvoiceItem.objects.filter(invoice__in=base.values("pk"))
        .values("line_type")
        .annotate(
            net=_sum(NET_INCOME),
            vat=_sum("vat_amount"),
            pass_through=_sum("pass_through_amount"),
        )
        .order_by("line_type")
    )

    # ---- data quality: things that make the figures incomplete ----
    live = live_invoices()
    paid_no_date = live.filter(
        invoice_type=Invoice.TYPE_LANDLORD_INVOICE,
        status=Invoice.STATUS_PAID,
        paid_at__isnull=True,
        created_at__date__lte=date_to,
    )
    statements_no_received_date = live.filter(
        invoice_type=Invoice.TYPE_REMITTANCE_STATEMENT,
        rent_received_on__isnull=True,
        created_at__date__lte=date_to,
    )

    return {
        "period": {"date_from": date_from, "date_to": date_to},
        "basis": basis,
        "invoice_count": len(invoices),
        "income": {
            "net_fees": total_net,
            "vat_collected": total_vat,
            "gross": total_net + total_vat,
            "pass_through_costs": total_pass,
        },
        "by_line_type": [
            {
                "line_type": row["line_type"],
                "label": LINE_TYPE_LABELS.get(row["line_type"], row["line_type"]),
                "net": row["net"],
                "vat": row["vat"],
                "pass_through": row["pass_through"],
            }
            for row in line_rows
        ],
        "by_month": [
            {"month": m, **by_month[m]} for m in sorted(by_month)
        ],
        "by_landlord": sorted(
            (
                {"landlord_id": lid, "landlord_name": v["name"], "net": v["net"], "vat": v["vat"]}
                for lid, v in by_landlord.items()
            ),
            key=lambda row: row["landlord_name"],
        ),
        "data_quality": {
            "paid_invoices_without_paid_date": {
                "count": paid_no_date.count(),
                "invoices": list(
                    paid_no_date.values("id", "invoice_ref")[:50]
                ),
            },
            "statements_without_rent_received_date": {
                "count": statements_no_received_date.count(),
            },
        },
        "notes": [
            "Income only: company expenses and input VAT are not recorded, so no net profit is shown.",
            "Net fees exclude pass-through costs (contractor costs and debit amounts); credits net to zero.",
            "VAT collected is output VAT on Jemsta's own fees.",
        ],
    }


# ==========================================================
# Landlord financial statement
# ==========================================================

def _line_detail(item):
    net = item.subtotal - item.pass_through_amount
    return {
        "line_type": item.line_type,
        "label": LINE_TYPE_LABELS.get(item.line_type, item.line_type),
        "description": item.description,
        "pass_through": item.pass_through_amount,
        "net_fees": net,
        "vat": item.vat_amount,
        "total": item.line_total,
    }


def landlord_statement(landlord, date_from, date_to, property_id=None):
    """
    What happened to a landlord's money in the period.

    Remittance statements are picked by the date the rent was received
    (falling back to issue date where that was never recorded). Landlord
    invoices billed directly (outside the rent) are listed separately.
    """
    statements = (
        live_invoices()
        .filter(landlord=landlord, invoice_type=Invoice.TYPE_REMITTANCE_STATEMENT)
        .filter(
            Q(rent_received_on__gte=date_from, rent_received_on__lte=date_to)
            | Q(
                rent_received_on__isnull=True,
                created_at__date__gte=date_from,
                created_at__date__lte=date_to,
            )
        )
    )
    direct = live_invoices().filter(
        landlord=landlord,
        invoice_type=Invoice.TYPE_LANDLORD_INVOICE,
        created_at__date__gte=date_from,
        created_at__date__lte=date_to,
    )
    if property_id:
        statements = statements.filter(property_id=property_id)
        direct = direct.filter(property_id=property_id)

    statements = statements.select_related("property").prefetch_related("items")
    statements = statements.order_by("rent_received_on", "created_at")

    totals = {
        "rent_received": ZERO,
        "company_fees": ZERO,
        "vat_on_fees": ZERO,
        "pass_through_costs": ZERO,
        "total_deducted": ZERO,
        "net_remitted": ZERO,
    }
    statement_rows = []

    for inv in statements:
        summary = remittance_summary(inv)
        totals["rent_received"] += summary["rent_received"]
        totals["company_fees"] += summary["company_fees"]
        totals["vat_on_fees"] += summary["vat_on_fees"]
        totals["pass_through_costs"] += summary["pass_through_costs"]
        totals["total_deducted"] += summary["total_deducted"]
        totals["net_remitted"] += summary["net_to_landlord"]

        statement_rows.append(
            {
                "invoice_id": inv.id,
                "invoice_ref": inv.invoice_ref,
                "property": str(inv.property),
                "from_date": inv.from_date,
                "to_date": inv.to_date,
                "rent_received_on": inv.rent_received_on,
                "plan": inv.plan,
                **summary,
                "lines": [_line_detail(item) for item in inv.items.all()],
            }
        )

    direct_rows = []
    direct_totals = {"net_fees": ZERO, "vat": ZERO, "pass_through": ZERO, "total": ZERO}

    for inv in direct.select_related("property", "project").annotate(
        net_fees=_sum(F("items__subtotal") - F("items__pass_through_amount")),
        pass_through=_sum("items__pass_through_amount"),
    ).order_by("created_at"):
        direct_totals["net_fees"] += inv.net_fees
        direct_totals["vat"] += inv.vat_fee
        direct_totals["pass_through"] += inv.pass_through
        direct_totals["total"] += inv.amount_payable
        direct_rows.append(
            {
                "invoice_id": inv.id,
                "invoice_ref": inv.invoice_ref,
                "property": str(inv.property),
                "project": inv.project.name if inv.project else None,
                "issued": timezone.localtime(inv.created_at).date(),
                "status": inv.status,
                "paid_at": inv.paid_at,
                "net_fees": inv.net_fees,
                "vat": inv.vat_fee,
                "pass_through": inv.pass_through,
                "total": inv.amount_payable,
            }
        )

    return {
        "landlord": {
            "id": landlord.id,
            "name": landlord.name,
            "plan": landlord.plan,
        },
        "period": {"date_from": date_from, "date_to": date_to},
        "remittance_statements": statement_rows,
        "remittance_totals": totals,
        "billed_directly": direct_rows,
        "billed_directly_totals": direct_totals,
        "notes": [
            "Pass-through costs are shown net of credits.",
            "Billed-directly invoices are charged to the landlord separately and are not deducted from rent.",
        ],
    }
