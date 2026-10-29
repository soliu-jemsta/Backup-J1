from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, RoleViewSet, GroupViewSet,
    register_user, login_user, current_user, get_roles,
    otp_verify_user, resend_otp_user,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'roles', RoleViewSet, basename='role')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user),
    path('login/', login_user),
    path('otp/verify/', otp_verify_user),
    path('otp/resend/', resend_otp_user),
    path('me/', current_user),
    path('role-choices/', get_roles),
]