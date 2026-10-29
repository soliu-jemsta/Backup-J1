# tenants/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Tenant, Tenancy, TenancyMember
from .serializers import TenantSerializer, TenancySerializer
from comments.serializers import CommentSerializer
from Users.permissions import AuthenticatedExceptOptions


class TenantViewSet(viewsets.ModelViewSet):
    permission_classes = [AuthenticatedExceptOptions]
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer

    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        tenant = self.get_object()
        if request.method == 'GET':
            comments = tenant.comments.all().order_by('-created_at')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            data = request.data.copy()
            data['content_type'] = 'tenant'
            data['object_id'] = tenant.id
            serializer = CommentSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    # 🔹 TENANCIES FOR THIS TENANT
    @action(detail=True, methods=['get'])
    def tenancies(self, request, pk=None):
        tenant = self.get_object()
        tenancies = Tenancy.objects.filter(members__tenant=tenant).distinct()
        serializer = TenancySerializer(tenancies, many=True)
        return Response(serializer.data)


class TenancyViewSet(viewsets.ModelViewSet):
    permission_classes = [AuthenticatedExceptOptions]
    queryset = Tenancy.objects.all()
    serializer_class = TenancySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        property_id = self.request.query_params.get('property')
        is_active = self.request.query_params.get('is_active')
        if property_id:
            qs = qs.filter(property_id=property_id)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')
        return qs

    # 🔹 Remove a single member without resending the whole `members` list
    @action(detail=True, methods=['delete'], url_path='members/(?P<member_id>[^/.]+)')
    def remove_member(self, request, pk=None, member_id=None):
        tenancy = self.get_object()
        member = tenancy.members.filter(id=member_id).first()
        if not member:
            return Response({'detail': 'Member not found on this tenancy.'},
                             status=status.HTTP_404_NOT_FOUND)
        if member.is_primary and tenancy.members.count() > 1:
            return Response({'detail': 'Cannot remove the primary tenant while other members exist.'},
                             status=status.HTTP_400_BAD_REQUEST)
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # 🔹 Reassign primary tenant without resending the whole `members` list
    @action(detail=True, methods=['post'], url_path='members/(?P<member_id>[^/.]+)/set-primary')
    def set_primary(self, request, pk=None, member_id=None):
        tenancy = self.get_object()
        member = tenancy.members.filter(id=member_id).first()
        if not member:
            return Response({'detail': 'Member not found on this tenancy.'},
                             status=status.HTTP_404_NOT_FOUND)
        tenancy.members.exclude(id=member.id).update(is_primary=False)
        member.is_primary = True
        member.save()
        return Response(TenancySerializer(tenancy).data)
