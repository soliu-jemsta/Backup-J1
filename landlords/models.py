from django.db import models
from django.db.models import Q
from django.conf import settings
from comments.models import Comment
from common.constants import PLAN_CHOICES, PLAN_FULL_MANAGEMENT
from django.contrib.contenttypes.fields import GenericRelation


class Landlord(models.Model):
    comments = GenericRelation(Comment)

    LLID = models.AutoField(primary_key=True)

    plan = models.CharField(
        max_length=30,
        choices=PLAN_CHOICES,
        default=PLAN_FULL_MANAGEMENT
    )

    LLType = models.CharField(
        max_length=20,
        choices=[
            ('sole', 'Sole'),
            ('joint', 'Joint'),
            ('group', 'Group'),
        ]
    )

    # ----------------------------------
    # SHARED DETAILS
    # ----------------------------------

    LLAddress = models.TextField(
        null=True,
        blank=True
    )

    AccountNumber = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    # ----------------------------------
    # DEPARTMENT ASSIGNMENTS
    # ----------------------------------

    finance_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_finance_landlords'
    )

    sales_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_sales_landlords'
    )

    property_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_property_manager_landlords'
    )

    # ----------------------------------
    # SYSTEM FIELDS
    # ----------------------------------

    RSWStatus = models.IntegerField(default=0)

    CreatedAt = models.DateTimeField(
        auto_now_add=True
    )

    Archived = models.BooleanField(
        default=False
    )

    class Meta:
        managed = True
        db_table = "landlords_landlord"

    def __str__(self):
        return f"Landlord {self.LLID}"

    # ----------------------------------
    # HELPERS
    # ----------------------------------

    @property
    def assigned_staff(self):
        return {
            "finance_manager": (
                self.finance_manager.username
                if self.finance_manager
                else None
            ),
            "sales_manager": (
                self.sales_manager.username
                if self.sales_manager
                else None
            ),
            "property_manager": (
                self.property_manager.username
                if self.property_manager
                else None
            ),
        }


class LandlordContact(models.Model):

    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=20
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class LandlordMember(models.Model):

    landlord = models.ForeignKey(
        Landlord,
        on_delete=models.CASCADE,
        related_name='members'
    )

    contact = models.ForeignKey(
        LandlordContact,
        on_delete=models.CASCADE,
        related_name='memberships'
    )

    is_primary = models.BooleanField(
        default=False
    )

    receives_notifications = models.BooleanField(
        default=True
    )
    def save(self, *args, **kwargs):
        if self.is_primary:
            # Demote any existing primary for this landlord
            LandlordMember.objects.filter(
                landlord=self.landlord,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
    
    class Meta:
        managed = True
        db_table = "landlords_landlord_member"
        unique_together = ('landlord', 'contact')

    def __str__(self):
        return (
            f"{self.contact} -> "
            f"Landlord {self.landlord.LLID}"
        )