from django.urls import path
from . import views
from django.urls import include

urlpatterns = [
    path('', views.RoomListView.as_view(), name='room-list'),
    path('<int:pk>/', views.RoomDetailView.as_view(), name='room-detail'),
    path('create/', views.RoomCreateView.as_view(), name='room-create'),
    path('my-rooms/', views.UserRoomsView.as_view(), name='user-rooms'),
    path('<int:pk>/update/', views.RoomUpdateView.as_view(), name='room-update'),
    path('<int:pk>/delete/', views.RoomDeleteView.as_view(), name='room-delete'),
    path('<int:room_id>/upload-image/', views.upload_room_image, name='upload-room-image'),
]
