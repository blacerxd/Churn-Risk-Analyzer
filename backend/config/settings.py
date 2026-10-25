import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR.parent / '.env')


def env_bool(name, default=False):
    return os.environ.get(name, str(default)).lower() in ('1', 'true', 'yes', 'on')


def env_list(name, default=''):
    return [item.strip() for item in os.environ.get(name, default).split(',') if item.strip()]


SECRET_KEY = os.environ['DJANGO_SECRET_KEY']
DEBUG = env_bool('DJANGO_DEBUG')
ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')
CSRF_TRUSTED_ORIGINS = env_list('DJANGO_CSRF_TRUSTED_ORIGINS')

# TLS ends on the host nginx, the container nginx passes the scheme through.
# Only reachable through them: the backend port is bound to 127.0.0.1.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = env_bool('DJANGO_SECURE_COOKIES')

INSTALLED_APPS = [
    'config.apps.ChurnAdminConfig',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # third-party
    'rest_framework',
    'drf_spectacular',
    # project apps
    'customers',
    'analytics',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Serves collectstatic output (admin) with DEBUG off
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'churn'),
        'USER': os.environ.get('POSTGRES_USER', 'churn'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', ''),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.SessionAuth',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'login': os.environ.get('LOGIN_THROTTLE_RATE', '10/min'),
    },
    'EXCEPTION_HANDLER': 'api.exceptions.api_exception_handler',
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Churn Risk Analyzer API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

METRICS_TOKEN = os.environ.get('METRICS_TOKEN', '')

AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

# SSO through any OIDC provider; endpoint paths default to Keycloak's layout.
# The browser is sent to OIDC_ISSUER_URL, the backend calls OIDC_ISSUER_INTERNAL_URL directly.
OIDC_ENABLED = env_bool('OIDC_ENABLED')
if OIDC_ENABLED:
    AUTHENTICATION_BACKENDS.append('api.oidc.OIDCBackend')
    # Defaults match the bundled Keycloak (docker-compose profile oidc)
    _public_url = os.environ.get('OIDC_PUBLIC_URL', 'http://localhost:8080').rstrip('/')
    _issuer = (os.environ.get('OIDC_ISSUER_URL') or f'{_public_url}/kc/realms/churn').rstrip('/')
    _issuer_internal = (os.environ.get('OIDC_ISSUER_INTERNAL_URL') or _issuer).rstrip('/')
    OIDC_RP_CLIENT_ID = os.environ.get('OIDC_CLIENT_ID', 'churn-panel')
    OIDC_RP_CLIENT_SECRET = os.environ['OIDC_CLIENT_SECRET']
    OIDC_RP_SIGN_ALGO = 'RS256'
    OIDC_RP_SCOPES = 'openid email profile'
    OIDC_USE_PKCE = True
    OIDC_OP_AUTHORIZATION_ENDPOINT = os.environ.get(
        'OIDC_OP_AUTHORIZATION_ENDPOINT', f'{_issuer}/protocol/openid-connect/auth')
    OIDC_OP_TOKEN_ENDPOINT = os.environ.get(
        'OIDC_OP_TOKEN_ENDPOINT', f'{_issuer_internal}/protocol/openid-connect/token')
    OIDC_OP_USER_ENDPOINT = os.environ.get(
        'OIDC_OP_USER_ENDPOINT', f'{_issuer_internal}/protocol/openid-connect/userinfo')
    OIDC_OP_JWKS_ENDPOINT = os.environ.get(
        'OIDC_OP_JWKS_ENDPOINT', f'{_issuer_internal}/protocol/openid-connect/certs')
    OIDC_AUTHENTICATION_CALLBACK_URL = 'oidc-callback'
    LOGIN_REDIRECT_URL = '/'
    LOGIN_REDIRECT_URL_FAILURE = '/login?error=sso'

# nginx (client_max_body_size in frontend/nginx.conf) cuts anything above 20 MB anyway.
SNAPSHOT_MAX_BYTES = int(os.environ.get('SNAPSHOT_MAX_BYTES', 20 * 1024 * 1024))
DATA_UPLOAD_MAX_MEMORY_SIZE = SNAPSHOT_MAX_BYTES

# Демонстрационные наборы для manage.py load_sample (в Docker монтируется в /sample-data).
SAMPLE_DATA_DIR = Path(os.environ.get('SAMPLE_DATA_DIR', BASE_DIR.parent / 'sample-data'))