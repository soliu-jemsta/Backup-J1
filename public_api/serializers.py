from rest_framework import serializers
from properties.models import Property, PropertyImage

class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = [
            "id",
            "image",
            "caption",
            "display_order",
            "is_primary",
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"http://87.106.96.208:8000{obj.image.url}"
        return None


class PublicPropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id',
            'name',
            'address',
            'town',
            'postcode',
            'listing_type',
            'property_type',
            'bedrooms',
            'bathrooms',
            'tenure',
            'status',
            'is_vacant',
            'available_from',
            'rent_amount',
            'description',
            'key_features',
            'images',
            'created_at',
        ]
        read_only_fields = fields
