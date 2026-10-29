from django.test import TestCase

import requests

from django.conf import settings


class MailgunService:
    """
    Reusable service for sending transactional emails through Mailgun.
    """

    def __init__(self):
        self.api_key = settings.MAILGUN_API_KEY
        self.domain = settings.MAILGUN_DOMAIN
        self.base_url = settings.MAILGUN_BASE_URL
        self.from_email = settings.DEFAULT_FROM_EMAIL

    def send_email(
        self,
        recipient,
        subject,
        text,
        html=None,
    ):
        """
        Send an email through Mailgun.

        Args:
            recipient (str): Recipient email address.
            subject (str): Email subject.
            text (str): Plain-text email body.
            html (str, optional): HTML email body.

        Returns:
            dict: Mailgun response data.

        Raises:
            Exception: If Mailgun fails to send the email.
        """

        url = f"{self.base_url}/{self.domain}/messages"

        data = {
            "from": self.from_email,
            "to": recipient,
            "subject": subject,
            "text": text,
        }

        if html:
            data["html"] = html

        try:
            response = requests.post(
                url,
                auth=("api", self.api_key),
                data=data,
                timeout=30,
            )

            response.raise_for_status()

            return response.json()

        except requests.exceptions.RequestException as exc:
            raise Exception(
                f"Mailgun email delivery failed: {str(exc)}"
            ) from exc


mailgun_service = MailgunService()
