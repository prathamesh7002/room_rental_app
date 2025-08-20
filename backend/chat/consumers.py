import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatMessage, ChatRoom
from notifications.models import Notification

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
        data = json.loads(text_data)
        action = data.get('action')

        # Read receipt handler
        if action == 'read':
            message_id = data.get('message_id')
            if message_id:
                # Mark as read if this user is the receiver
                updated = await self.mark_message_read(message_id, self.scope['user'].id)
                if updated:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'read_receipt',
                            'message_id': message_id,
                            'reader_id': self.scope['user'].id,
                        }
                    )
            return

        # Default: send chat message
        message = data['message']
        receiver_id = data['receiver_id']

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
        # Notify receiver
        await self.create_and_send_notification(receiver_id, message, chat_message)
    
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'timestamp': event['timestamp'],
            'message_id': event['message_id']
        }))

    async def read_receipt(self, event):
        # Broadcast read receipt to both participants in room
        await self.send(text_data=json.dumps({
            'event': 'read',
            'message_id': event['message_id'],
            'reader_id': event['reader_id'],
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

    @database_sync_to_async
    def mark_message_read(self, message_id, reader_id):
        try:
            msg = ChatMessage.objects.select_related('receiver').get(id=message_id)
            if msg.receiver_id == reader_id and not msg.is_read:
                msg.is_read = True
                msg.save(update_fields=['is_read'])
                return True
        except ChatMessage.DoesNotExist:
            return False
        return False

    @database_sync_to_async
    def create_notification(self, receiver_id, message, chat_message):
        receiver = User.objects.get(id=receiver_id)
        notif = Notification.objects.create(
            user=receiver,
            title=f"New message from {self.scope['user'].username}",
            message=message,
            data={'room_id': int(self.room_id), 'sender_id': self.scope['user'].id, 'message_id': chat_message.id}
        )
        return notif

    async def create_and_send_notification(self, receiver_id, message, chat_message):
        notif = await self.create_notification(receiver_id, message, chat_message)
        await self.channel_layer.group_send(
            f'user_{receiver_id}',
            {
                'type': 'notify',
                'payload': {
                    'id': notif.id,
                    'title': notif.title,
                    'message': notif.message,
                    'data': notif.data,
                    'is_read': notif.is_read,
                    'created_at': notif.created_at.isoformat(),
                }
            }
        )
