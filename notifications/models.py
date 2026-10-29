from django.db import models
from django.conf import settings

from django.conf import settings
from django.db import models


class Notification(models.Model):

    TYPE_CHOICES = [
        ("OTP", "OTP"),
        ("RENT_DUE", "Rent Due"),
        ("RENT_OVERDUE", "Rent Overdue"),
        ("TENANCY_EXPIRY", "Tenancy Expiry"),
        ("COMPLIANCE_EXPIRY", "Compliance Expiry"),
        ("MAINTENANCE", "Maintenance"),
        ("INVOICE", "Invoice"),
        ("SYSTEM", "System"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    notification_type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    related_object_type = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    related_object_id = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    
    
class EmailDelivery(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SENDING", "Sending"),
        ("SENT", "Sent"),
        ("FAILED", "Failed"),
    ]

    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name="email_deliveries"
    )

    recipient_email = models.EmailField()

    subject = models.CharField(max_length=255)

    template_name = models.CharField(
        max_length=255
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    mailgun_message_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    error_message = models.TextField(
        blank=True,
        null=True
    )

    sent_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
    

class OTPVerification(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="otp_verifications"
    )

    otp_hash = models.CharField(
        max_length=128
    )

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(
        default=0
    )

    is_used = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )