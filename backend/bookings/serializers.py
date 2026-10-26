from rest_framework import serializers
from .models import Booking
from services.serializers import ServiceSerializer
from users.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(write_only=True)
    service = ServiceSerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['status', 'payment_status', 'customer', 'provider']
