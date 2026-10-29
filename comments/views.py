# comments/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from django.shortcuts import render
from rest_framework.decorators import action
from django.contrib.contenttypes.models import ContentType

from .models import Comment
from .serializers import CommentSerializer
from Users.permissions import AuthenticatedExceptOptions


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [AuthenticatedExceptOptions]

    def get_queryset(self):
        """
        Optional filtering:
        /api/comments/?content_type=property&object_id=1
        """
        queryset = super().get_queryset()

        content_type = self.request.query_params.get('content_type')
        object_id = self.request.query_params.get('object_id')

        if content_type and object_id:
            try:
                ct = ContentType.objects.get(model=content_type.lower())
                queryset = queryset.filter(content_type=ct, object_id=object_id)
            except ContentType.DoesNotExist:
                return Comment.objects.none()

        return queryset

    def perform_create(self, serializer):
        """
        Automatically attach logged-in user
        """
        serializer.save(user=self.request.user)