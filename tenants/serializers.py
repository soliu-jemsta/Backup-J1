from rest_framework import serializers
from .models import Tenant, Tenancy, TenancyMember
from django.db import transaction


# ==========================================
# TENANT
# ==========================================

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'first_name', 'last_name', 'email', 'phone']


# ==========================================
# TENANCY MEMBER — INPUT (write)
# ==========================================

class TenancyMemberInputSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    is_primary = serializers.BooleanField(default=False)
    receives_notifications = serializers.BooleanField(default=True)


# ==========================================
# TENANCY MEMBER — OUTPUT (read)
# ==========================================

class TenancyMemberOutputSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer()

    class Meta:
        model = TenancyMember
        fields = ['id', 'tenant', 'is_primary', 'receives_notifications']


# ==========================================
# TENANCY
# ==========================================

class TenancySerializer(serializers.ModelSerializer):
    members = TenancyMemberInputSerializer(many=True, write_only=True)
    member_details = TenancyMemberOutputSerializer(
        source='members', many=True, read_only=True
    )

    class Meta:
        model = Tenancy
        fields = [
            'id',
            'property',
            'start_date',
            'end_date',
            'is_active',
            'members',
            'member_details',
        ]

    # ==========================================
    # VALIDATION
    # ==========================================

    def validate_members(self, value):
        if len(value) == 0:
            raise serializers.ValidationError("At least one tenant is required.")

        primary_count = sum(1 for m in value if m.get('is_primary'))

        if primary_count != 1:
            raise serializers.ValidationError("Exactly one primary tenant is required.")

        return value

    # ==========================================
    # CREATE
    # ==========================================

    @transaction.atomic
    def create(self, validated_data):
        members_data = validated_data.pop('members')
        tenancy = Tenancy.objects.create(**validated_data)

        for member in members_data:
            tenant, _ = Tenant.objects.get_or_create(
                email=member['email'],
                defaults={
                    'first_name': member['first_name'],
                    'last_name': member['last_name'],
                    'phone': member['phone'],
                }
            )
            TenancyMember.objects.create(
                tenancy=tenancy,
                tenant=tenant,
                is_primary=member.get('is_primary', False),
                receives_notifications=member.get('receives_notifications', True)
            )

        return tenancy

    # ==========================================
    # UPDATE
    # ==========================================

    @transaction.atomic
    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if members_data is not None:
            existing = {m.tenant.email: m for m in instance.members.all()}
            incoming_emails = []

            for member in members_data:
                email = member['email']
                incoming_emails.append(email)

                tenant, _ = Tenant.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': member['first_name'],
                        'last_name': member['last_name'],
                        'phone': member['phone'],
                    }
                )

                # Update tenant details if they already exist
                if not _:
                    tenant.first_name = member.get('first_name', tenant.first_name)
                    tenant.last_name = member.get('last_name', tenant.last_name)
                    tenant.phone = member.get('phone', tenant.phone)
                    tenant.save()

                if email in existing:
                    # Update membership flags only
                    membership = existing[email]
                    membership.is_primary = member.get('is_primary', membership.is_primary)
                    membership.receives_notifications = member.get(
                        'receives_notifications', membership.receives_notifications
                    )
                    membership.save()
                else:
                    # Add new member to tenancy
                    TenancyMember.objects.create(
                        tenancy=instance,
                        tenant=tenant,
                        is_primary=member.get('is_primary', False),
                        receives_notifications=member.get('receives_notifications', True)
                    )

            # Remove members not in the incoming list
            for email, membership in existing.items():
                if email not in incoming_emails:
                    membership.delete()

        return instance
