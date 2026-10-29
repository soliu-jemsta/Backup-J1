from django.db import models


class Tenant(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Tenancy(models.Model):
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='tenancies'
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Tenancy at {self.property}"


class TenancyMember(models.Model):
    tenancy = models.ForeignKey(
        Tenancy,
        on_delete=models.CASCADE,
        related_name='members'
    )
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='memberships'
    )

    is_primary = models.BooleanField(default=False)
    receives_notifications = models.BooleanField(default=True)

    class Meta:
        unique_together = ('tenancy', 'tenant')