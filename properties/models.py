import os
from django.db import models
from comments.models import Comment
from django.utils.text import slugify
from django.contrib.contenttypes.fields import GenericRelation


class Property(models.Model):

    LISTING_TYPE_CHOICES = [
        ('rent', 'Rent'),
        ('sale', 'Sale'),
    ]

    PROPERTY_TYPE_CHOICES = [
        ('detached', 'Detached'),
        ('semi_detached', 'Semi-Detached'),
        ('terraced', 'Terraced'),
        ('flat', 'Flat/Apartment'),
        ('bungalow', 'Bungalow'),
        ('other', 'Other'),
    ]

    TENURE_CHOICES = [
        ('freehold', 'Freehold'),
        ('leasehold', 'Leasehold'),
    ]

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('under_offer', 'Under Offer'),
        ('sold', 'Sold'),
        ('let', 'Let'),
    ]

    comments = GenericRelation(Comment)

    landlord = models.ForeignKey(
        "landlords.Landlord",
        on_delete=models.CASCADE,
        related_name="properties"
    )

    name = models.CharField(max_length=200)
    address = models.TextField()
    town = models.CharField(max_length=100, null=True, blank=True)
    postcode = models.CharField(max_length=10, null=True, blank=True)

    listing_type = models.CharField(
        max_length=10,
        choices=LISTING_TYPE_CHOICES,
        default='rent',
    )

    property_type = models.CharField(
        max_length=20,
        choices=PROPERTY_TYPE_CHOICES,
        null=True,
        blank=True,
    )

    bedrooms = models.PositiveIntegerField(null=True, blank=True)
    bathrooms = models.PositiveIntegerField(null=True, blank=True)

    tenure = models.CharField(
        max_length=10,
        choices=TENURE_CHOICES,
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='available',
    )

    is_vacant = models.BooleanField(default=True)

    available_from = models.DateField(null=True, blank=True)

    rent_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    administration_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    maintenance_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    
    description = models.TextField(null=True, blank=True)

    key_features = models.JSONField(
        default=list,
        blank=True,
        help_text="List of bullet point features e.g. ['Garden', 'Parking', 'EPC rating C']"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


def property_image_upload_path(instance, filename):
    """
    Generates:
    properties/<property_id>/<property-name>-<property_id>-<sequence>.jpg
    """
    property_obj = instance.property
    property_id = property_obj.id

    property_name = slugify(property_obj.name)
    extension = os.path.splitext(filename)[1].lower()
    existing_count = property_obj.images.count() + 1

    filename = (
        f"{property_name}-{property_id}-"
        f"{existing_count:02d}{extension}"
    )

    return f"properties/{property_id}/{filename}"


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to=property_image_upload_path
    )

    caption = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    display_order = models.PositiveIntegerField(
        default=0
    )

    is_primary = models.BooleanField(
        default=False
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return f"Listing for {self.property.name}"