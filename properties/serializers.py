from rest_framework import serializers
from .models import Property, PropertyImage
from landlords.models import Landlord


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = [
            "id",
            "image",
            "caption",
            "display_order",
            "is_primary",
            "uploaded_at",
        ]


class PropertySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    landlord = serializers.PrimaryKeyRelatedField(
        queryset=Landlord.objects.all()
    )
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "landlord",
            "name",
            "address",
            "town",
            "postcode",
            "listing_type",
            "property_type",
            "bedrooms",
            "bathrooms",
            "tenure",
            "status",
            "is_vacant",
            "available_from",
            "rent_amount",
            "administration_rate",
            "maintenance_rate",
            "description",
            "key_features",
            "created_at",
            "images",
        ]

    def create(self, validated_data):
        property_obj = Property.objects.create(**validated_data)

        request = self.context.get('request')
        if request:
            image_files = request.FILES.getlist('images')
            for f in image_files:
                PropertyImage.objects.create(property=property_obj, image=f)

        return property_obj