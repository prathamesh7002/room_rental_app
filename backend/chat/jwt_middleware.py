from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication


class JwtAuthMiddleware:
    """
    ASGI middleware that authenticates a user from a JWT token.
    Token is read from either:
    - Query string: ws://.../?token=JWT
    - Authorization header: Authorization: Bearer JWT
    """

    def __init__(self, app):
        self.app = app
        self.jwt_auth = JWTAuthentication()

    async def __call__(self, scope, receive, send):
        # copy to avoid mutating original scope
        scope = dict(scope)
        token = self._get_token_from_headers(scope) or self._get_token_from_query(scope)
        scope["user"] = await self._authenticate(token)
        return await self.app(scope, receive, send)

    def _get_token_from_headers(self, scope):
        headers = dict(scope.get('headers', []))
        auth = headers.get(b'authorization')
        if not auth:
            return None
        try:
            auth_str = auth.decode()
            if auth_str.lower().startswith('bearer '):
                return auth_str.split(' ', 1)[1].strip()
        except Exception:
            return None
        return None

    def _get_token_from_query(self, scope):
        try:
            query_string = scope.get('query_string', b'').decode()
            params = parse_qs(query_string)
            token_list = params.get('token')
            if token_list:
                return token_list[0]
        except Exception:
            return None
        return None

    @database_sync_to_async
    def _authenticate(self, token):
        if not token:
            return AnonymousUser()
        try:
            validated_token = self.jwt_auth.get_validated_token(token)
            user = self.jwt_auth.get_user(validated_token)
            return user
        except Exception:
            return AnonymousUser()
