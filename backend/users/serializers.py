from rest_framework import serializers
from .models import User, ProviderProfile

class ProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = ['id_number', 'business_registration_number', 'is_approved']
        read_only_fields = ['is_approved']

class UserSerializer(serializers.ModelSerializer):
    provider_profile = ProviderProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'role', 'password', 'provider_profile']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', User.Role.CUSTOMER)
        )
        user.set_password(validated_data['password'])
        user.save()
        
        if user.role == User.Role.PROVIDER:
            ProviderProfile.objects.create(user=user)
            
        return user
