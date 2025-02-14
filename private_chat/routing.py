from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from . import urls
import logging

logger = logging.getLogger(__name__)

# Log WebSocket connection attempts and errors
class LoggingMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        try:
            logger.info(f"WebSocket connection attempt: {scope['path']}")
            # Ensure the user is authenticated before proceeding
            if "user" not in scope:
                logger.warning("WebSocket connection attempt by unauthenticated user")
                raise ValueError("User is not authenticated")
            return await self.inner(scope, receive, send)
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            raise

application = ProtocolTypeRouter({
    "websocket": LoggingMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                urls.websocket_urlpatterns
            )
        )
    ),
})