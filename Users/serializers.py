from rest_framework import serializers
from django.contrib.auth.models import Group

from .models import User
from landlords.models import Landlord


# =========================
# GROUP SERIALIZER
# =========================
class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        fields = ["id", "name"]


# =========================
# USER SERIALIZER
# =========================
class UserSerializer(serializers.ModelSerializer):

    groups = GroupSerializer(
        many=True,
        read_only=True
    )

    group_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.all(),
        write_only=True,
        required=False
    )

    password = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "password",
            "role",
            "groups",
            "group_ids",
            "is_active",
            "is_staff",
        ]

    # =========================
    # CREATE USER
    # =========================
    def create(self, validated_data):

        groups = validated_data.pop("group_ids", [])
        password = validated_data.pop("password", None)

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()

        if groups:
            user.groups.set(groups)

        return user

    # =========================
    # UPDATE USER
    # =========================
    def update(self, instance, validated_data):

        groups = validated_data.pop("group_ids", None)
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if groups is not None:
            instance.groups.set(groups)

        return instance


# =========================
# LANDLORD SERIALIZER
# =========================
class LandlordSerializer(serializers.ModelSerializer):

    Manager = UserSerializer(
        read_only=True
    )

    ManagerID = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(
            groups__name="Property Manager"
        ),
        source="Manager",
        write_only=True
    )

    class Meta:
        model = Landlord

        fields = [
            "id",
            "LLName",
            "LLType",
            "LLEmail",
            "LLPhone",
            "SecondaryLLName",
            "SecondaryLLEmail",
            "SecondaryPhone",
            "AccountNumber",
            "AccountDigits",
            "RSWStatus",
            "LLAddress",
            "Manager",
            "ManagerID",
            "CreatedAt",
            "Archived",
        ]
