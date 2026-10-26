from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ProviderProfile

admin.site.register(User, UserAdmin)

@admin.register(ProviderProfile)
class ProviderProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'id_number', 'is_approved']
    list_filter = ['is_approved']
    actions = ['approve_providers']

    def approve_providers(self, request, queryset):
        queryset.update(is_approved=True)
    approve_providers.short_description = "Approve selected provider profiles"
