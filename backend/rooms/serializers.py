from rest_framework import serializers
from .models import Room, RoomImage
from accounts.serializers import UserSerializer

class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ('id', 'image', 'uploaded_at')

class RoomSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    images = RoomImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Room
        fields = ('id', 'title', 'description', 'rent', 'location', 'room_type', 
                 'wifi', 'ac', 'furnished', 'parking', 'laundry', 'owner', 
                 'created_at', 'updated_at', 'is_available', 'images')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

class RoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('title', 'description', 'rent', 'location', 'room_type', 
                 'wifi', 'ac', 'furnished', 'parking', 'laundry')
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
