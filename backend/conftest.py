import pytest
from django.core.cache import cache
from rest_framework.test import APIClient


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(django_user_model):
    return django_user_model.objects.create_user(username='analyst', password='secret-pass')


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user)
    return api_client
