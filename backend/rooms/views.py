from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .models import Room, RoomImage, WishlistItem
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


# =========================
# Wishlist API Endpoints
# Base URL included under /api/wishlist/
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    """Return the authenticated user's wishlist rooms."""
    room_ids = WishlistItem.objects.filter(user=request.user).values_list('room_id', flat=True)
    rooms = Room.objects.filter(id__in=room_ids)
    serializer = RoomSerializer(rooms, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_check(request, room_id: int):
    """Return { is_wishlisted: boolean } for a room."""
    exists = WishlistItem.objects.filter(user=request.user, room_id=room_id).exists()
    return Response({ 'is_wishlisted': exists })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wishlist_add(request):
    """Add a room to wishlist. Body: { room_id }"""
    room_id = request.data.get('room_id')
    if not room_id:
        return Response({'error': 'room_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

    WishlistItem.objects.get_or_create(user=request.user, room=room)
    return Response({'detail': 'Added to wishlist'}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_remove(request, room_id: int):
    """Remove a room from wishlist."""
    WishlistItem.objects.filter(user=request.user, room_id=room_id).delete()
    return Response({'detail': 'Removed from wishlist'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_clear(request):
    """Clear entire wishlist for the user."""
    WishlistItem.objects.filter(user=request.user).delete()
    return Response({'detail': 'Wishlist cleared'}, status=status.HTTP_204_NO_CONTENT)
