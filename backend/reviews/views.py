from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer
from bookings.models import Booking

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == "PROVIDER":
            return Review.objects.filter(provider=user)
        return Review.objects.filter(customer=user)

    def perform_create(self, serializer):
        booking = Booking.objects.get(id=self.request.data.get('booking'))
        serializer.save(
            customer=self.request.user,
            provider=booking.provider
        )
