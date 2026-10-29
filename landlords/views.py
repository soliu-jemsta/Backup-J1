from rest_framework import viewsets
from .models import Landlord
from .serializers import LandlordSerializer
from Users.permissions import AuthenticatedExceptOptions

class LandlordViewSet(viewsets.ModelViewSet):
    serializer_class = LandlordSerializer
    permission_classes = [AuthenticatedExceptOptions]

    def get_queryset(self):
        return Landlord.objects.prefetch_related(
            "members__contact"
        ).select_related(
            "finance_manager",
            "sales_manager",
            "property_manager",
        ).filter(Archived=False)