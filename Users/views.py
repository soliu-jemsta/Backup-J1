from django.contrib.auth import authenticate
from django.contrib.auth.models import Group
from django.utils import timezone
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired

from rest_framework import status, viewsets
from rest_framework.decorators import (
    api_view,
    permission_classes
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated
)
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer
from .permissions import AuthenticatedExceptOptions

from authentication.services.email_service import EmailService
from authentication.services.otp_service import OTPService


signer = TimestampSigner(salt="otp-pending-login")
OTP_TTL_SECONDS = 60


# =========================
# USER VIEWSET
# =========================
class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [AuthenticatedExceptOptions]

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# =========================
# GROUP VIEWSET
# =========================
class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        groups = Group.objects.all().values('id', 'name')
        return Response(list(groups))

    def retrieve(self, request, pk=None):
        try:
            group = Group.objects.get(pk=pk)
            return Response({'id': group.id, 'name': group.name})
        except Group.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


# =========================
# REGISTER USER
# =========================
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):

    serializer = UserSerializer(
        data=request.data
    )

    if serializer.is_valid():

        user = serializer.save()

        # -------------------------
        # DEFAULT GROUP
        # -------------------------
        account_admin_group, created = Group.objects.get_or_create(
            name="Account Admin"
        )

        user.groups.add(account_admin_group)

        return Response(
            {
                "message": "User created successfully"
            },
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================
# LOGIN USER (step 1: password -> triggers OTP, except for the public service account)
# =========================
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(
        username=username,
        password=password
    )

    if user is None:
        return Response(
            {
                "error": "Invalid username or password"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {
                "error": "Account inactive"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    # -------------------------
    # Public service account bypasses OTP entirely —
    # this is a machine login with no human to read the code.
    # -------------------------
    if getattr(user, "role", None) == "public_service":
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "groups": list(
                        user.groups.values_list(
                            "name",
                            flat=True
                        )
                    )
                }
            }
        )

    code = OTPService.generate_otp()
    expires_at = timezone.now().timestamp() + OTP_TTL_SECONDS

    payload = f"{user.pk}:{code}:{expires_at}"
    otp_token = signer.sign(payload)

    EmailService.send_otp(user.email, code)

    return Response(
        {
            "otp_token": otp_token,
            "expires_in": OTP_TTL_SECONDS
        }
    )


# =========================
# VERIFY OTP (step 2: otp_token + code -> JWT)
# =========================
@api_view(["POST"])
@permission_classes([AllowAny])
def otp_verify_user(request):

    otp_token = request.data.get("otp_token")
    entered_code = (request.data.get("code") or "").upper()

    if not otp_token or not entered_code:
        return Response(
            {"error": "otp_token and code are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        payload = signer.unsign(otp_token, max_age=OTP_TTL_SECONDS + 30)
    except SignatureExpired:
        return Response(
            {"error": "OTP expired, please log in again"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except BadSignature:
        return Response(
            {"error": "Invalid or tampered token"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user_id, stored_code, expires_at = payload.split(":", 2)

    if timezone.now().timestamp() > float(expires_at):
        return Response(
            {"error": "OTP expired, please log in again"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if entered_code != stored_code:
        return Response(
            {"error": "Incorrect code"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.get(pk=int(user_id))
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),

            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "groups": list(
                    user.groups.values_list(
                        "name",
                        flat=True
                    )
                )
            }
        }
    )


# =========================
# RESEND OTP
# =========================
@api_view(["POST"])
@permission_classes([AllowAny])
def resend_otp_user(request):

    otp_token = request.data.get("otp_token")

    if not otp_token:
        return Response(
            {"error": "otp_token is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        payload = signer.unsign(otp_token, max_age=None)
    except BadSignature:
        return Response(
            {"error": "Invalid token"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user_id = payload.split(":", 1)[0]
    user = User.objects.get(pk=int(user_id))

    code = OTPService.generate_otp()
    expires_at = timezone.now().timestamp() + OTP_TTL_SECONDS
    new_token = signer.sign(f"{user_id}:{code}:{expires_at}")

    EmailService.send_otp(user.email, code)

    return Response(
        {
            "otp_token": new_token,
            "expires_in": OTP_TTL_SECONDS
        }
    )


# =========================
# CURRENT USER
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):

    serializer = UserSerializer(request.user)

    return Response(serializer.data)

# =========================
# GET ROLES
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_roles(request):
    roles = [
        {"value": "staff", "label": "Staff"},
        {"value": "landlord", "label": "Landlord"},
        {"value": "tenant", "label": "Tenant"},
    ]
    return Response(roles)

# =========================
# ROLE VIEWSET
# =========================
class RoleViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        roles = [
            {"value": "staff", "label": "Staff"},
            {"value": "landlord", "label": "Landlord"},
            {"value": "tenant", "label": "Tenant"},
        ]
        return Response(roles)