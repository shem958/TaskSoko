from rest_framework import viewsets, permissions
from .models import Category, Service
from .serializers import CategorySerializer, ServiceSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    
    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
            
        # Example location bounds querying
        # min_lat, max_lat, min_lng, max_lng from frontend
        min_lat = self.request.query_params.get('min_lat')
        max_lat = self.request.query_params.get('max_lat')
        min_lng = self.request.query_params.get('min_lng')
        max_lng = self.request.query_params.get('max_lng')
        
        if all([min_lat, max_lat, min_lng, max_lng]):
            queryset = queryset.filter(
                latitude__gte=min_lat, latitude__lte=max_lat,
                longitude__gte=min_lng, longitude__lte=max_lng
            )
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)
