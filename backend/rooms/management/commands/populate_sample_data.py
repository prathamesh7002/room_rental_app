from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rooms.models import Room

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with sample room data'

    def handle(self, *args, **options):
        # Create sample users with secure random passwords
        import secrets
        import string
        
        def generate_password():
            alphabet = string.ascii_letters + string.digits
            return ''.join(secrets.choice(alphabet) for i in range(12))

        # Create sample users
        if not User.objects.filter(username='owner1').exists():
            password = generate_password()
            owner1 = User.objects.create_user(
                username='owner1',
                email='owner1@example.com',
                password=password,
                first_name='John',
                last_name='Doe',
                role='owner',
                phone='9876543210'
            )
            self.stdout.write(f'Created owner: {owner1.username} (password: {password})')

        if not User.objects.filter(username='owner2').exists():
            password = generate_password()
            owner2 = User.objects.create_user(
                username='owner2',
                email='owner2@example.com',
                password=password,
                first_name='Jane',
                last_name='Smith',
                role='owner',
                phone='9876543211'
            )
            self.stdout.write(f'Created owner: {owner2.username} (password: {password})')

        if not User.objects.filter(username='renter1').exists():
            password = generate_password()
            renter1 = User.objects.create_user(
                username='renter1',
                email='renter1@example.com',
                password=password,
                first_name='Mike',
                last_name='Johnson',
                role='renter',
                phone='9876543212'
            )
            self.stdout.write(f'Created renter: {renter1.username} (password: {password})')

        # Get users for room creation
        owner1 = User.objects.get(username='owner1')
        owner2 = User.objects.get(username='owner2')

        # Create sample rooms
        sample_rooms = [
            {
                'title': 'Spacious 1BHK near Metro Station',
                'description': 'Beautiful 1BHK apartment with modern amenities. Close to metro station and shopping centers. Perfect for working professionals.',
                'rent': 15000,
                'location': 'Koramangala, Bangalore',
                'room_type': '1bhk',
                'wifi': True,
                'ac': True,
                'furnished': True,
                'parking': True,
                'laundry': False,
                'owner': owner1
            },
            {
                'title': 'Affordable PG for Students',
                'description': 'Clean and safe PG accommodation for students. Includes meals, WiFi, and study area. Near major colleges.',
                'rent': 8000,
                'location': 'HSR Layout, Bangalore',
                'room_type': 'pg',
                'wifi': True,
                'ac': False,
                'furnished': True,
                'parking': False,
                'laundry': True,
                'owner': owner2
            },
            {
                'title': 'Luxury 2BHK Apartment',
                'description': 'Premium 2BHK apartment with all modern amenities. Gym, swimming pool, and 24/7 security.',
                'rent': 25000,
                'location': 'Whitefield, Bangalore',
                'room_type': '2bhk',
                'wifi': True,
                'ac': True,
                'furnished': True,
                'parking': True,
                'laundry': True,
                'owner': owner1
            },
            {
                'title': 'Shared Room for Working Professionals',
                'description': 'Shared accommodation in a well-maintained building. Ideal for working professionals looking for affordable housing.',
                'rent': 6000,
                'location': 'Electronic City, Bangalore',
                'room_type': 'shared',
                'wifi': True,
                'ac': True,
                'furnished': True,
                'parking': False,
                'laundry': True,
                'owner': owner2
            },
            {
                'title': 'Modern Studio Apartment',
                'description': 'Compact and modern studio apartment perfect for singles. Fully furnished with kitchen and all amenities.',
                'rent': 12000,
                'location': 'Indiranagar, Bangalore',
                'room_type': 'studio',
                'wifi': True,
                'ac': True,
                'furnished': True,
                'parking': False,
                'laundry': False,
                'owner': owner1
            },
            {
                'title': 'Spacious 3BHK Family Home',
                'description': 'Large 3BHK house perfect for families. Garden, parking, and quiet neighborhood.',
                'rent': 35000,
                'location': 'Jayanagar, Bangalore',
                'room_type': '3bhk',
                'wifi': True,
                'ac': True,
                'furnished': False,
                'parking': True,
                'laundry': True,
                'owner': owner2
            }
        ]

        for room_data in sample_rooms:
            if not Room.objects.filter(title=room_data['title']).exists():
                room = Room.objects.create(**room_data)
                self.stdout.write(f'Created room: {room.title}')

        self.stdout.write(self.style.SUCCESS('Successfully populated sample data!'))
