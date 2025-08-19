from django.contrib import admin
from .models import Room, RoomImage

class RoomImageInline(admin.TabularInline):
    model = RoomImage
    extra = 1

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('title', 'rent', 'location', 'room_type', 'owner', 'is_available', 'created_at')
    list_filter = ('room_type', 'is_available', 'wifi', 'ac', 'furnished')
    search_fields = ('title', 'location', 'description')
    inlines = [RoomImageInline]
    
@admin.register(RoomImage)
class RoomImageAdmin(admin.ModelAdmin):
    list_display = ('room', 'uploaded_at')
    list_filter = ('uploaded_at',)
