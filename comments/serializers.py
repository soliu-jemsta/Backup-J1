# comments/serializers.py
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import Comment

ALLOWED_MODELS = ['landlord', 'property', 'tenant']


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    content_type = serializers.CharField(write_only=True)

    class Meta:
        model = Comment
        fields = [
            'id',
            'user',
            'text',
            'content_type',
            'object_id',
            'created_at',
            'updated_at',
            'is_internal'
        ]

    def validate_content_type(self, value):
        if value.lower() not in ALLOWED_MODELS:
            raise serializers.ValidationError("Invalid content type")
        return value.lower()

    def create(self, validated_data):
        content_type_str = validated_data.pop('content_type')
        content_type = ContentType.objects.get(model=content_type_str)

        validated_data['content_type'] = content_type
        validated_data['user'] = self.context['request'].user

        return super().create(validated_data)