from django.core.mail import send_mail
from jemsta_backend import settings

class EmailService:
    @staticmethod
    def send_otp(email, code):
        send_mail(
            subject="Your Jemsta Login Verification Code",
            message=(
                f"Your Jemsta verification code is: {code}\n\n"
                f"This code will expire in 60 seconds. If you didn't request this, "
                f"you can safely ignore this email.\n\n"
                f"— Jemsta"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email], #if multiple recipients, then write `email`. otherwise, `[email]`
            fail_silently=False,
        )
