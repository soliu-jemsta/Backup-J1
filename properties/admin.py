from django.contrib import admin
from .models import Property, PropertyImage


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'address', 'listing_type', 'is_vacant', 'rent_amount', 'created_at']
    list_filter = ['listing_type', 'is_vacant']
    search_fields = ['name', 'address']


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'property', 'caption', 'display_order', 'is_primary', 'uploaded_at']
    list_filter = ['is_primary']
