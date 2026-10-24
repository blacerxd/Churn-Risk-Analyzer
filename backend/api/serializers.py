from django.contrib.auth import get_user_model
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'username']


class SnapshotUploadSerializer(serializers.Serializer):
    file = serializers.FileField(help_text='JSON-файл снимка')


class SnapshotResultSerializer(serializers.Serializer):
    accounts = serializers.IntegerField()
    services = serializers.IntegerField()
    transactions = serializers.IntegerField()
    status_changes = serializers.IntegerField(help_text='Сколько услуг сменили статус по сравнению с прошлым снимком')
    imported_at = serializers.DateTimeField()
    recalculated_at = serializers.DateTimeField(allow_null=True)


class SnapshotErrorItemSerializer(serializers.Serializer):
    path = serializers.CharField(help_text='Путь к полю в исходном JSON, например services[3].ownerId')
    message = serializers.CharField()


class SnapshotErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()
    code = serializers.CharField()
    errors = SnapshotErrorItemSerializer(many=True, required=False)
    errors_total = serializers.IntegerField(required=False)
