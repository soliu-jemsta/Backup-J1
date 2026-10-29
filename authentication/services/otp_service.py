import secrets
import string

class OTPService:
    @staticmethod
    def generate_otp(): #length always 6
        alphaNum = string.ascii_uppercase + string.digits
        secureStr = ''.join(secrets.choice(alphaNum) for _ in range(6))
        return secureStr
