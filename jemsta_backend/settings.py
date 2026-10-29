from pathlib import Path
import os
from datetime import timedelta


# Optional dotenv
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


# =========================
# BASE DIRECTORY
# =========================

BASE_DIR = Path(__file__).resolve().parent.parent

INVOICE_TEMPLATE_PATH = (
    BASE_DIR / "invoices/templates/invoice_template.xlsx"
)


# =========================
# SECURITY
# =========================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "dev-insecure-key"
)

DEBUG = os.getenv(
    "DEBUG",
    "False"
) == "True"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "*").split(",")
]




SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),

    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,

    "UPDATE_LAST_LOGIN": True,
}

# =========================
# APPLICATIONS
# =========================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',

    'rest_framework',
    'rest_framework_simplejwt',
    "rest_framework_simplejwt.token_blacklist",

    # Your apps
    'landlords',
    'properties',
    'tenants',
    'Users',
    'invoices',
    'projects',
    'comments',
    'public_api',
    'notifications',
    'authentication',
    'audit',
    'reports'
]

# =========================
# auditlog settings
# =========================
AUDITED_MODELS = {
    # Core records
    "landlords.Landlord": {},
    "landlords.LandlordContact": {},
    "landlords.LandlordMember": {},
    "properties.Property": {},
    "properties.PropertyImage": {},
    "tenants.Tenant": {},
    "tenants.Tenancy": {},
    "tenants.TenancyMember": {},

    # Financial
    "projects.ProjectType": {},
    "projects.FinancialSettings": {},
    "projects.Project": {},
    "projects.ProjectDebit": {},
    "projects.ProjectCredit": {},
    "invoices.Invoice": {},
    "invoices.InvoiceItem": {},

    # Other
    "comments.Comment": {},
    "Users.User": {"exclude": ["password", "last_login"]}, 
}

# =========================
# MAILGUN SETTINGS
# =========================
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")
MAILGUN_BASE_URL = os.getenv(
    "MAILGUN_BASE_URL",
    "https://api.mailgun.net/v3",
)

DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    "Jemsta PMS <notifications@mg.jemstaapp.co.uk>",
)


# =========================
# POSTMARK SETTINGS
# =========================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.postmarkapp.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("POSTMARK_SERVER_TOKEN")
EMAIL_HOST_PASSWORD = os.getenv("POSTMARK_SERVER_TOKEN")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")


# =========================
# MIDDLEWARE
# =========================

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',

    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "audit.middleware.AuditContextMiddleware",
]


# =========================
# ROOT URLS / WSGI
# =========================

ROOT_URLCONF = 'jemsta_backend.urls'

WSGI_APPLICATION = 'jemsta_backend.wsgi.application'


# =========================
# TEMPLATES
# =========================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,

        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# =========================
# DATABASE
# =========================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv("DATABASE_NAME"),
        'USER': os.getenv("DATABASE_USER"),
        'PASSWORD': os.getenv("DATABASE_PASSWORD"),
        'HOST': os.getenv("DATABASE_HOST", "db"),  # "db" = the compose service name
        'PORT': os.getenv("DATABASE_PORT", "3306"),
        'OPTIONS': {
            # Remove ssl entirely, or add charset
            'charset': 'utf8mb4',
        }
    }
}


# =========================
# AUTH USER MODEL
# =========================

AUTH_USER_MODEL = 'Users.User'


# =========================
# REST FRAMEWORK
# =========================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],

    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# =========================
# PASSWORD VALIDATION
# =========================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'UserAttributeSimilarityValidator'
        ),
    },

    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'MinimumLengthValidator'
        ),
    },

    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'CommonPasswordValidator'
        ),
    },

    {
        'NAME': (
            'django.contrib.auth.password_validation.'
            'NumericPasswordValidator'
        ),
    },
]


# =========================
# INTERNATIONALIZATION
# =========================

LANGUAGE_CODE = 'en-uk'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# =========================
# STATIC FILES
# =========================

STATIC_URL = '/static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_STORAGE = (
    'whitenoise.storage.'
    'CompressedManifestStaticFilesStorage'
)


# =========================
# MEDIA FILES
# =========================

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# =========================
# DEFAULT PRIMARY KEY
# =========================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# =========================
# CORS
# =========================

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS","http://87.106.96.208:8081,""http://87.106.96.208:8082,""http://localhost:8081,""http://localhost:8082,""http://localhost:5173,""http://127.0.0.1:5173").split(",")


SECURE_PROXY_SSL_HEADER = (
    'HTTP_X_FORWARDED_PROTO',
    'https',
)
