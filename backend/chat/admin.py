from django.contrib import admin
from .models import ChatMessage, ChatRoom

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'message', 'timestamp', 'is_read')
    list_filter = ('timestamp', 'is_read')
    search_fields = ('sender__username', 'receiver__username', 'message')
    readonly_fields = ('timestamp',)

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_participants', 'created_at', 'last_message')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)
    
    def get_participants(self, obj):
        return ", ".join([user.username for user in obj.participants.all()])
    get_participants.short_description = 'Participants'
