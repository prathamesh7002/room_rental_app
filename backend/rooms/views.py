from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .models import Room, RoomImage
from .serializers import RoomSerializer, RoomCreateSerializer, RoomImageSerializer

class RoomListView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Room.objects.filter(is_available=True)
        
        # Search filters
        location = self.request.query_params.get('location', None)
        min_rent = self.request.query_params.get('min_rent', None)
        max_rent = self.request.query_params.get('max_rent', None)
        room_type = self.request.query_params.get('room_type', None)
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        if min_rent:
            queryset = queryset.filter(rent__gte=min_rent)
        if max_rent:
            queryset = queryset.filter(rent__lte=max_rent)
        if room_type:
            queryset = queryset.filter(room_type=room_type)
            
        return queryset

class RoomDetailView(generics.RetrieveAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]

class RoomCreateView(generics.CreateAPIView):
    serializer_class = RoomCreateSerializer
    permission_classes = [IsAuthenticated]

class UserRoomsView(generics.ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Room.objects.filter(owner=self.request.user)

class RoomUpdateView(generics.UpdateAPIView):
    serializer_class = RoomCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Room.objects.filter(owner=self.request.user)

class RoomDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Room.objects.filter(owner=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_room_image(request, room_id):
    try:
        room = Room.objects.get(id=room_id, owner=request.user)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = RoomImageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(room=room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
