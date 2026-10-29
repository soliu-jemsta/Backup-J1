from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from properties.models import Property
from .serializers import PublicPropertySerializer
from .permissions import IsPublicServiceAccount


class PublicRentalPropertyListView(generics.ListAPIView):
    serializer_class = PublicPropertySerializer
    permission_classes = [IsAuthenticated, IsPublicServiceAccount]

    def get_queryset(self):
        return (
            Property.objects.filter(
                listing_type='rent',
                status='available',
            )
            .prefetch_related('images')
            .order_by('-created_at')
        )


class PublicSalePropertyListView(generics.ListAPIView):
    serializer_class = PublicPropertySerializer
    permission_classes = [IsAuthenticated, IsPublicServiceAccount]

    def get_queryset(self):
        return (
            Property.objects.filter(
                listing_type='sale',
                status__in=['available', 'under_offer'],
            )
            .prefetch_related('images')
            .order_by('-created_at')
        )


class PublicPropertyDetailView(generics.RetrieveAPIView):
    serializer_class = PublicPropertySerializer
    permission_classes = [IsAuthenticated, IsPublicServiceAccount]

    def get_queryset(self):
        return (
            Property.objects.all()
            .prefetch_related('images')
        )