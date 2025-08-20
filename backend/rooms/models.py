from django.db import models
from django.conf import settings

class Room(models.Model):
    ROOM_TYPES = [
        ('1bhk', '1BHK Apartment'),
        ('2bhk', '2BHK Apartment'),
        ('3bhk', '3BHK Apartment'),
        ('pg', 'PG for Students'),
        ('shared', 'Shared Room'),
        ('studio', 'Studio Apartment'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=200)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    
    # Facilities
    wifi = models.BooleanField(default=False)
    ac = models.BooleanField(default=False)
    furnished = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    laundry = models.BooleanField(default=False)
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_available = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - ₹{self.rent}"

class RoomImage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='room_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.room.title}"


class WishlistItem(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist_items')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'room')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ➜ {self.room.title}"
