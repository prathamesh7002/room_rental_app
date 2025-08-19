from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import ChatMessage, ChatRoom
from .serializers import ChatMessageSerializer, ChatRoomSerializer

User = get_user_model()

class ChatRoomListView(generics.ListAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_or_create_chat_room(request, user_id):
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Find existing chat room between these two users
    chat_room = ChatRoom.objects.filter(
        participants=request.user
    ).filter(
        participants=other_user
    ).first()
    
    if not chat_room:
        # Create new chat room
        chat_room = ChatRoom.objects.create()
        chat_room.participants.add(request.user, other_user)
    
    return Response(ChatRoomSerializer(chat_room).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, room_id):
    try:
        chat_room = ChatRoom.objects.get(id=room_id, participants=request.user)
    except ChatRoom.DoesNotExist:
        return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)
    
    messages = ChatMessage.objects.filter(
        Q(sender__in=chat_room.participants.all()) & 
        Q(receiver__in=chat_room.participants.all())
    ).order_by('timestamp')
    
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    receiver_id = request.data.get('receiver_id')
    message_text = request.data.get('message')
    
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)
    
    message = ChatMessage.objects.create(
        sender=request.user,
        receiver=receiver,
        message=message_text
    )
    
    # Update or create chat room
    chat_room = ChatRoom.objects.filter(
        participants=request.user
    ).filter(
        participants=receiver
    ).first()
    
    if not chat_room:
        chat_room = ChatRoom.objects.create()
        chat_room.participants.add(request.user, receiver)
    
    chat_room.last_message = message
    chat_room.save()
    
    return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)
