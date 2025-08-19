from rest_framework import serializers
from .models import ChatMessage, ChatRoom
from accounts.serializers import UserSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ('id', 'sender', 'receiver', 'message', 'timestamp', 'is_read')
        read_only_fields = ('id', 'sender', 'timestamp')

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = ChatMessageSerializer(read_only=True)
    
    class Meta:
        model = ChatRoom
        fields = ('id', 'participants', 'created_at', 'last_message')
        read_only_fields = ('id', 'created_at')
