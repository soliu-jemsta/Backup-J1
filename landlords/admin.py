from django.contrib import admin
from .models import Landlord, LandlordContact, LandlordMember

@admin.register(Landlord)
class LandlordAdmin(admin.ModelAdmin):
        list_display = ['LLID', 'LLType', 'plan', 'Archived', 'CreatedAt']
        list_filter = ['LLType', 'plan', 'Archived']
        search_fields = ["LLName","LLEmail","LLPhone",]

@admin.register(LandlordContact)
class LandlordContactAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'last_name', 'email', 'phone']
    search_fields = ['first_name', 'last_name', 'email']

@admin.register(LandlordMember)
class LandlordMemberAdmin(admin.ModelAdmin):
    list_display = ['id', 'landlord', 'contact', 'is_primary', 'receives_notifications']
    list_filter = ['is_primary', 'receives_notifications']
