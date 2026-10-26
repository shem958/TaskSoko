from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import User, ProviderProfile
from .serializers import UserSerializer, ProviderProfileSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class KYCSubmitView(generics.UpdateAPIView):
    serializer_class = ProviderProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = ProviderProfile.objects.get_or_create(user=self.request.user)
        return profile
