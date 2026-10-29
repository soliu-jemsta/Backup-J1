from rest_framework.permissions import BasePermission, IsAuthenticated


class IsPublicServiceAccount(BasePermission):
    """
    Only allows access to the designated public service account user.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'public_service'
        )


class AuthenticatedExceptOptions(BasePermission):
    """
    Allows unauthenticated OPTIONS requests (for field/schema discovery)
    but requires auth for everything else.
    """
    def has_permission(self, request, view):
        if request.method == 'OPTIONS':
            return True
        return IsAuthenticated().has_permission(request, view)