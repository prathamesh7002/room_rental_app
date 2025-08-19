import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatMessage, ChatRoom

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        receiver_id = text_data_json['receiver_id']
        
        # Save message to database
        chat_message = await self.save_message(
            sender=self.scope['user'],
            receiver_id=receiver_id,
            message=message
        )
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender_id': self.scope['user'].id,
                'sender_username': self.scope['user'].username,
                'timestamp': chat_message.timestamp.isoformat(),
                'message_id': chat_message.id
            }
        )
    
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'timestamp': event['timestamp'],
            'message_id': event['message_id']
        }))
    
    @database_sync_to_async
    def save_message(self, sender, receiver_id, message):
        receiver = User.objects.get(id=receiver_id)
        chat_message = ChatMessage.objects.create(
            sender=sender,
            receiver=receiver,
            message=message
        )
        
        # Update or create chat room
        chat_room = ChatRoom.objects.filter(
            participants=sender
        ).filter(
            participants=receiver
        ).first()
        
        if not chat_room:
            chat_room = ChatRoom.objects.create()
            chat_room.participants.add(sender, receiver)
        
        chat_room.last_message = chat_message
        chat_room.save()
        
        return chat_message
