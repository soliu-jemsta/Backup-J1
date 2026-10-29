#users/permissions.py
from rest_framework.permissions import BasePermission, IsAuthenticated


class AuthenticatedExceptOptions(BasePermission):
    """
    Allows unauthenticated OPTIONS requests (for field/schema discovery)
    but requires auth for everything else.
    """
    def has_permission(self, request, view):
        if request.method == 'OPTIONS':
            return True
        return IsAuthenticated().has_permission(request, view)