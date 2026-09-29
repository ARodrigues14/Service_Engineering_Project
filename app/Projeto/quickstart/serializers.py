from django.contrib.auth.models import Group, User
from rest_framework import serializers
from .models import LoanRequest, UserModel

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta(object):
        model = UserModel
        fields = ['id', 'username', 'password', 'email', 'photo', 'phone_no', 'face_id']

class LoginSerializer(serializers.HyperlinkedModelSerializer):
    class Meta(object):
        model = UserModel
        fields = ['username', 'photo']

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']
        
class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanRequest
        fields = '__all__'  # Include all fields from the LoanRequest model
        app_label = 'quickstart'  # Ensure this matches your app label

class LoanSerializer2(serializers.ModelSerializer):
    class Meta:
        model = LoanRequest
        fields = ['id', 'amount', 'interest_rate', 'term', 'created_at']
        app_label = 'quickstart'
        
class LoanRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanRequest
        fields = ['use_case', 'amount', 'term', 'salary']
        app_label = 'quickstart'