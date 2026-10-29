from decimal import Decimal

PLAN_TENANT_FIND = "tenant_find"
PLAN_RENT_COLLECTION = "rent_collection"
PLAN_FULL_MANAGEMENT = "full_management"
PLAN_PREMIUM = "premium"

PLAN_CHOICES = [
    (PLAN_TENANT_FIND, "Tenant Find"),
    (PLAN_RENT_COLLECTION, "Rent Collection"),
    (PLAN_FULL_MANAGEMENT, "Full Management"),
    (PLAN_PREMIUM, "Premium"),
]

VAT_RATE = Decimal("0.075")