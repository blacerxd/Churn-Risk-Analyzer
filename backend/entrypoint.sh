#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
    python manage.py createsuperuser --noinput 2>/dev/null || true
fi

# Fills an empty database with the sample set, dates shifted to now: case | extended | none
case "${SAMPLE_AUTOLOAD:-none}" in
    case) python manage.py load_sample --if-empty ;;
    extended) python manage.py load_sample --extended --if-empty ;;
esac

exec uvicorn config.asgi:application --host 0.0.0.0 --port 8000
