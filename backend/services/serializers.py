from rest_framework import serializers
from .models import Category, Service
from users.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    provider = UserSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['provider', 'rating', 'reviews_count', 'created_at']
