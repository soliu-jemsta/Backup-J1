from rest_framework import serializers
from .models import Landlord, LandlordContact, LandlordMember
from Users.models import User


# ==========================================
# LANDLORD CONTACT
# ==========================================

class LandlordContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = LandlordContact
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
        ]


# ==========================================
# LANDLORD MEMBER
# ==========================================

class LandlordMemberSerializer(serializers.ModelSerializer):

    contact = LandlordContactSerializer()

    class Meta:
        model = LandlordMember
        fields = [
            "id",
            "contact",
            "is_primary",
            "receives_notifications",
        ]


# ==========================================
# LANDLORD
# ==========================================

class LandlordSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(
        source="LLID",
        read_only=True,
    )

    type = serializers.ChoiceField(
        source="LLType",
        choices=["sole", "joint", "group"],
    )

    correspondence_address = serializers.CharField(
        source="LLAddress",
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    account_number = serializers.CharField(
        source="AccountNumber",
        required=False,
        allow_null=True,
        allow_blank=True,
    )

    created_at = serializers.DateTimeField(
        source="CreatedAt",
        read_only=True,
    )

    rsw_status = serializers.IntegerField(
        source="RSWStatus",
        required=False,
    )

    archived = serializers.BooleanField(
        source="Archived",
        read_only=True,
    )

    # --------------------------------------
    # DEPARTMENT ASSIGNMENTS — read
    # --------------------------------------

    finance_manager = serializers.StringRelatedField(read_only=True)
    sales_manager = serializers.StringRelatedField(read_only=True)
    property_manager = serializers.StringRelatedField(read_only=True)

    # --------------------------------------
    # DEPARTMENT ASSIGNMENTS — write
    # --------------------------------------

    finance_manager_id = serializers.PrimaryKeyRelatedField(
        source="finance_manager",
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    sales_manager_id = serializers.PrimaryKeyRelatedField(
        source="sales_manager",
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    property_manager_id = serializers.PrimaryKeyRelatedField(
        source="property_manager",
        queryset=User.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    # --------------------------------------
    # MEMBERS
    # --------------------------------------

    members = LandlordMemberSerializer(many=True)

    class Meta:
        model = Landlord
        fields = [
            "id",
            "type",
            "plan",
            "correspondence_address",
            "account_number",

            "finance_manager",
            "sales_manager",
            "property_manager",

            "finance_manager_id",
            "sales_manager_id",
            "property_manager_id",

            "rsw_status",
            "created_at",
            "archived",
            "members",
        ]

    # ==========================================
    # VALIDATION
    # ==========================================

    def validate(self, data):
        ll_type = data.get("LLType")

        # Use validated members data, not initial_data
        members = data.get("members", [])

        if ll_type == "sole" and len(members) != 1:
            raise serializers.ValidationError(
                {"members": "Sole landlords must have exactly one contact."}
            )

        if ll_type == "joint" and len(members) < 2:
            raise serializers.ValidationError(
                {"members": "Joint landlords must have at least two contacts."}
            )

        primary_contacts = [m for m in members if m.get("is_primary")]

        if len(primary_contacts) != 1:
            raise serializers.ValidationError(
                {"members": "Exactly one member must be marked as primary."}
            )

        # --------------------------------------
        # GROUP VALIDATION
        # --------------------------------------

        finance_manager = data.get("finance_manager")
        sales_manager = data.get("sales_manager")
        property_manager = data.get("property_manager")

        if finance_manager and not finance_manager.groups.filter(
            name="Finance Manager"
        ).exists():
            raise serializers.ValidationError(
                {"finance_manager_id": "User must belong to the Finance Manager group."}
            )

        if sales_manager and not sales_manager.groups.filter(
            name="Sales & Lettings"
        ).exists():
            raise serializers.ValidationError(
                {"sales_manager_id": "User must belong to the Sales & Lettings group."}
            )

        if property_manager and not property_manager.groups.filter(
            name="Property Manager"
        ).exists():
            raise serializers.ValidationError(
                {"property_manager_id": "User must belong to the Property Manager group."}
            )

        return data

    # ==========================================
    # HELPERS
    # ==========================================

    def _create_members(self, landlord, members_data):
        for member_data in members_data:
            contact_data = member_data.pop("contact")
            contact = LandlordContact.objects.create(**contact_data)
            LandlordMember.objects.create(
                landlord=landlord,
                contact=contact,
                **member_data,
            )

    # ==========================================
    # CREATE
    # ==========================================

    def create(self, validated_data):
        members_data = validated_data.pop("members", [])
        landlord = Landlord.objects.create(**validated_data)
        self._create_members(landlord, members_data)
        return landlord

    # ==========================================
    # UPDATE
    # ==========================================

    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if members_data is not None:
            existing = {m.contact.email: m for m in instance.members.all()}
            incoming_emails = []

            for member_data in members_data:
                contact_data = member_data.get('contact')
                email = contact_data['email']
                incoming_emails.append(email)

                if email in existing:
                    # Update existing contact and membership
                    membership = existing[email]
                    contact = membership.contact
                    for attr, value in contact_data.items():
                        setattr(contact, attr, value)
                    contact.save()

                    membership.is_primary = member_data.get('is_primary', membership.is_primary)
                    membership.receives_notifications = member_data.get(
                        'receives_notifications', membership.receives_notifications
                    )
                    membership.save()
                else:
                    # Create new contact and membership
                    contact = LandlordContact.objects.create(**contact_data)
                    LandlordMember.objects.create(
                        landlord=instance,
                        contact=contact,
                        is_primary=member_data.get('is_primary', False),
                        receives_notifications=member_data.get('receives_notifications', True)
                    )

            # Remove members not in the incoming list
            for email, membership in existing.items():
                if email not in incoming_emails:
                    membership.contact.delete()  # cascades to LandlordMember

        return instance