# Room Rental Platform

A full-stack web application for room rentals with real-time chat functionality.

## Tech Stack

**Frontend:**
- React 18
- TailwindCSS
- React Router
- Axios

**Backend:**
- Django 4.2
- Django REST Framework
- Django Channels (WebSockets)
- JWT Authentication
- SQLite Database

## Project Structure

```
room-rental-platform/
├── backend/          # Django backend
└── frontend/         # React frontend
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd windsurf-project
   ```

2. **Backend Environment Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your local development settings
   ```

3. **Frontend Environment Setup**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your local development settings
   ```

4. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py populate_sample_data
   ```

5. **Create Admin User (Secure)**
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to create your admin user with a secure password.

6. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

7. **Run the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Security Notes

- **Never commit `.env` files** - use `.env.example` as template
- **Change SECRET_KEY** in production
- **Use environment variables** for sensitive data

## Features

- User authentication (JWT with refresh tokens)
- Room listing and advanced search/filtering
- Real-time chat between owners and renters
- Image upload for room photos
- Responsive design with TailwindCSS
- Profile management
- Admin panel for management

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update profile

### Rooms
- `GET /api/rooms/` - List all rooms (with filters)
- `GET /api/rooms/{id}/` - Room details
- `POST /api/rooms/create/` - Create room (auth required)
- `GET /api/rooms/my-rooms/` - User's rooms (auth required)
- `PUT /api/rooms/{id}/update/` - Update room (owner only)
- `DELETE /api/rooms/{id}/delete/` - Delete room (owner only)
- `POST /api/rooms/{id}/upload-image/` - Upload room image

### Chat
- `GET /api/chat/rooms/` - User's chat rooms
- `GET /api/chat/room/{user_id}/` - Get/create chat room
- `GET /api/chat/messages/{room_id}/` - Get messages
- `POST /api/chat/send/` - Send message

## Production Deployment

### Environment Configuration

**Backend (.env.production):**
```bash
ENVIRONMENT=production
SECRET_KEY=your-secure-50-character-random-string
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=roomrental_prod
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_secure_password
REDIS_URL=redis://localhost:6379/0
```

**Frontend (.env.production):**
```bash
REACT_APP_API_BASE_URL=https://yourdomain.com/api
REACT_APP_WS_BASE_URL=wss://yourdomain.com/ws
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

### Production Checklist
- [ ] Set `ENVIRONMENT=production` in backend `.env`
- [ ] Generate secure `SECRET_KEY` (50+ characters)
- [ ] Configure PostgreSQL database
- [ ] Set up Redis for WebSocket scaling
- [ ] Configure HTTPS/SSL certificates
- [ ] Set secure CORS origins
- [ ] Configure email backend for notifications
- [ ] Set up static file serving (WhiteNoise included)
- [ ] Configure logging and monitoring

## Access Points

**Development:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

**Production:**
- **Frontend**: https://yourdomain.com
- **Backend API**: https://yourdomain.com/api
- **Admin Panel**: https://yourdomain.com/admin
