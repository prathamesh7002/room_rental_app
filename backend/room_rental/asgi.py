"""
ASGI config for room_rental project.
"""

import os

# IMPORTANT: Configure settings before importing Django or app modules
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'room_rental.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Initialize Django first to load apps
django_asgi_app = get_asgi_application()

# Now it's safe to import modules that may touch Django models
from chat.jwt_middleware import JwtAuthMiddleware  # noqa: E402
import chat.routing  # noqa: E402
import notifications.routing  # noqa: E402

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    # Order: first JWT, then session-based auth (kept for dev convenience)
    "websocket": JwtAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                chat.routing.websocket_urlpatterns +
                notifications.routing.websocket_urlpatterns
            )
        )
    ),
})
