from django.urls import path
from . import views

urlpatterns = [
    path('rooms/', views.ChatRoomListView.as_view(), name='chat-room-list'),
    path('room/<int:user_id>/', views.get_or_create_chat_room, name='get-or-create-chat-room'),
    path('messages/<int:room_id>/', views.get_chat_messages, name='get-chat-messages'),
    path('send/', views.send_message, name='send-message'),
]
