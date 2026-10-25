from django.contrib.admin.apps import AdminConfig


class ChurnAdminConfig(AdminConfig):
    default_site = 'config.admin.ChurnAdminSite'
