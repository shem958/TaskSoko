from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Booking
from .serializers import BookingSerializer
from services.models import Service
from users.models import User

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.PROVIDER:
            return Booking.objects.filter(provider=user)
        return Booking.objects.filter(customer=user)

    def perform_create(self, serializer):
        service_id = self.request.data.get('service_id')
        service = Service.objects.get(id=service_id)
        serializer.save(
            customer=self.request.user,
            provider=service.provider,
            service=service
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if request.user != booking.provider:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        
        booking.status = Booking.Status.ACCEPTED
        booking.save()
        return Response({'status': 'Booking accepted.'})

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if request.user != booking.provider:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        
        booking.status = Booking.Status.COMPLETED
        booking.save()
        return Response({'status': 'Booking completed.'})
