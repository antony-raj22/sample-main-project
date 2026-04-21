from rest_framework import serializers
from .models import Person, Task
from django.contrib.auth.models import User  # ← fix: auth not outh

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):  # ← fix: no space in serializers.ModelSerializer
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):  # ← fix: indented INSIDE the class
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user