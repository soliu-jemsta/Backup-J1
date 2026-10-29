from decimal import Decimal
from common.constants import (
    PLAN_TENANT_FIND,
    PLAN_RENT_COLLECTION,
    PLAN_FULL_MANAGEMENT,
    PLAN_PREMIUM,
    VAT_RATE
)


# ==============================================================
# 🧮 CORE CALCULATION ENGINE (PURE)
# ==============================================================

def calculate_invoice(rent, landlord_plan, extras=None):
    """
    Pure function:
    - no ORM
    - no models
    - only numbers in, numbers out
    """

    if extras is None:
        extras = []

    # ================= BASE FEE =================
    if landlord_plan == PLAN_TENANT_FIND:
        annual_rent = rent * Decimal("12")
        fee = max(annual_rent * Decimal("0.10"), Decimal("895"))
        is_one_time = True

    elif landlord_plan == PLAN_RENT_COLLECTION:
        fee = rent * Decimal("0.08")
        is_one_time = False

    elif landlord_plan == PLAN_FULL_MANAGEMENT:
        fee = rent * Decimal("0.15")
        is_one_time = False

    elif landlord_plan == PLAN_PREMIUM:
        fee = rent * Decimal("0.10")
        is_one_time = False

    else:
        raise ValueError(f"Invalid landlord plan: {landlord_plan}")

    # ================= EXTRAS =================
    extras_total = Decimal("0")

    for extra in extras:
        amount = getattr(extra, "amount", None)
        is_percentage = getattr(extra, "is_percentage", False)

        if is_percentage:
            extras_total += rent * (extra.amount / Decimal("100"))
        else:
            extras_total += amount or Decimal("0")

    # ================= VAT =================
    vat = (fee + extras_total) * VAT_RATE

    # ================= TOTAL =================
    total = fee + extras_total + vat

    return {
        "rent": rent,
        "management_fee": fee,
        "extras": extras_total,
        "vat": vat,
        "total": total,
        "is_one_time": is_one_time
    }