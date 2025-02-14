from django.test import TestCase
from channels.testing import WebsocketCommunicator
from private_chat.consumers.chat_consumers import ChatConsumer
from users_accounts.models import UserProfile
from private_chat.models import MessageModel
from django.contrib.auth.models import User
from datetime import date
from channels.db import database_sync_to_async

class ChatConsumerTests(TestCase):
    async def test_save_text_message(self):
        # Create test users with a valid birthdate
        user1 = await database_sync_to_async(UserProfile.objects.create)(
            user=await database_sync_to_async(User.objects.create)(username="user1"),
            birthdate=date(1990, 1, 1)  # Add a valid birthdate
        )
        user2 = await database_sync_to_async(UserProfile.objects.create)(
            user=await database_sync_to_async(User.objects.create)(username="user2"),
            birthdate=date(1995, 1, 1)  # Add a valid birthdate
        )

        # Simulate WebSocket connection with an authenticated user
        communicator = WebsocketCommunicator(
            ChatConsumer.as_asgi(),
            "/ws/chat/"
        )
        communicator.scope["user"] = user1.user  # Simulate authenticated user
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Simulate sending a text message
        message_data = {
            "type": "text_message",
            "text": "Hello, world!",
            "user_pk": str(user2.pk),
            "random_id": 123
        }
        await communicator.send_json_to(message_data)

        # Verify that the message was saved
        message = await database_sync_to_async(MessageModel.objects.first)()
        self.assertEqual(message.text, "Hello, world!")
        self.assertEqual(message.sender, user1)
        self.assertEqual(message.recipient, user2)

        # Verify that the message was broadcast
        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "new_text_message")
        self.assertEqual(response["text"], "Hello, world!")

        # Clean up
        await communicator.disconnect()