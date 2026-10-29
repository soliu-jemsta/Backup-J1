from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    ROLE_CHOICES = [
        ('staff', 'Staff'),
        ('landlord', 'Landlord'),
        ('tenant', 'Tenant'),
        ('public_service', 'Public Service'),
    ]

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='staff',
    )

    # -------------------------
    # DEPARTMENT HELPERS
    # -------------------------
    def is_admin_manager(self):
        return self.groups.filter(
            name="Admin"
        ).exists()

    def is_finance_manager(self):
        return self.groups.filter(
            name="Finance Management"
        ).exists()

    def is_sales_manager(self):
        return self.groups.filter(
            name="Sales & Lettings Management"
        ).exists()

    def is_property_manager(self):
        return self.groups.filter(
            name="Property Management"
        ).exists()

    # -------------------------
    # DISPLAY
    # -------------------------
    def __str__(self):
        return self.username