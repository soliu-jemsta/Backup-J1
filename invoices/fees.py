from decimal import Decimal, ROUND_HALF_UP

from common.constants import (
    PLAN_TENANT_FIND,
    PLAN_RENT_COLLECTION,
    PLAN_FULL_MANAGEMENT,
    PLAN_PREMIUM,
)

TWO_DP = Decimal("0.01")

# Recurring plans: percentage of the rent received for the period.
RECURRING_PLAN_RATES = {
    PLAN_RENT_COLLECTION: Decimal("8.00"),
    PLAN_PREMIUM: Decimal("10.00"),
    PLAN_FULL_MANAGEMENT: Decimal("15.00"),
}

# Tenant Find: one-time fee, greater of a percentage of annual rent or a minimum.
TENANT_FIND_RATE = Decimal("10.00")
TENANT_FIND_MINIMUM = Decimal("895.00")


def _money(value):
    return value.quantize(TWO_DP, rounding=ROUND_HALF_UP)


def calculate_management_fee(plan, rent_received, monthly_rent=None):
    """
    Pure function: numbers in, numbers out. No ORM, and no VAT.

    VAT is added later by InvoiceItem.save() from the snapshotted rate, so
    this returns the net fee only.

    plan           - one of the PLAN_* constants
    rent_received  - rent actually received for the period (confirmed by the
                     user from the bank before the statement is created)
    monthly_rent   - needed for Tenant Find, which is based on annual rent

    Returns a dict:
        fee          net fee, rounded to 2dp
        rate         percentage applied (the snapshot to store on the item)
        is_one_time  True for Tenant Find, False for recurring plans
        label        short description for the statement line
    """
    if plan in RECURRING_PLAN_RATES:
        rate = RECURRING_PLAN_RATES[plan]
        return {
            "fee": _money(rent_received * rate / Decimal("100")),
            "rate": rate,
            "is_one_time": False,
            "label": f"Management fee ({rate}% of rent received)",
        }

    if plan == PLAN_TENANT_FIND:
        if monthly_rent is None:
            raise ValueError("monthly_rent is required for the Tenant Find plan.")
        annual_rent = monthly_rent * Decimal("12")
        percentage_fee = annual_rent * TENANT_FIND_RATE / Decimal("100")
        return {
            "fee": _money(max(percentage_fee, TENANT_FIND_MINIMUM)),
            "rate": TENANT_FIND_RATE,
            "is_one_time": True,
            "label": (
                f"Tenant find fee ({TENANT_FIND_RATE}% of annual rent, "
                f"minimum £{TENANT_FIND_MINIMUM})"
            ),
        }

    raise ValueError(f"Invalid landlord plan: {plan}")
