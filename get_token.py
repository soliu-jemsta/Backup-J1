import os
import django

# Point to your settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Jemsta_backend.settings.settings')

django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


def get_user_token(username):
    try:
        user = User.objects.get(username=username)
        token, created = Token.objects.get_or_create(user=user)

        print("User:", user.username)
        print("Token:", token.key)
        print("Newly created:", created)

    except User.DoesNotExist:
        print("User does not exist")


if __name__ == "__main__":
    get_user_token("your_username")