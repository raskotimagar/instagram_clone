import json
from typing import Optional, Dict, Tuple

from channels.generic.websocket import AsyncWebsocketConsumer
from users_accounts.models import UserProfile

from .db_operations import get_groups_to_add, get_unread_count, get_user_by_pk, get_file_by_id, get_message_by_id, \
    save_file_message, save_text_message, mark_message_as_read
from .message_types import MessageTypes, MessageTypeMessageRead, MessageTypeFileMessage, MessageTypeTextMessage, \
    OutgoingEventMessageRead, OutgoingEventNewTextMessage, OutgoingEventNewUnreadCount, OutgoingEventMessageIdCreated, \
    OutgoingEventNewFileMessage, OutgoingEventIsTyping, OutgoingEventStoppedTyping, OutgoingEventWentOnline, OutgoingEventWentOffline

from .errors import ErrorTypes, ErrorDescription
from private_chat.models import MessageModel, UploadedFile
from private_chat.serializers import serialize_file_model
from django.conf import settings
import logging
from asgiref.sync import sync_to_async

logger = logging.getLogger('private_chat.chat_consumer')
TEXT_MAX_LENGTH = getattr(settings, 'TEXT_MAX_LENGTH', 65535)
UNAUTH_REJECT_CODE: int = 4001


class ChatConsumer(AsyncWebsocketConsumer):
    async def _after_message_save(self, msg: MessageModel, rid: int, user_pk: str):
        """Helper method to broadcast events after a message is saved."""
        ev = OutgoingEventMessageIdCreated(random_id=rid, db_id=msg.id)._asdict()
        logger.info(f"Message with id {msg.id} saved, firing events to {user_pk} & {self.group_name}")
        await self.channel_layer.group_send(user_pk, ev)
        await self.channel_layer.group_send(self.group_name, ev)
        new_unreads = await get_unread_count(self.group_name, user_pk)
        await self.channel_layer.group_send(user_pk, OutgoingEventNewUnreadCount(sender=self.group_name, unread_count=new_unreads)._asdict())

    async def connect(self):
        """Handles new WebSocket connections."""
        if self.scope["user"].is_authenticated:
            self.user = self.scope["user"] 
            self.user_profile = await sync_to_async(UserProfile.objects.get)(user=self.user)  
            self.group_name = str(self.user_profile.pk)
            self.sender_username = self.user.get_username()
            logger.info(f"User {self.user.pk} connected, adding {self.channel_name} to {self.group_name}")
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            dialogs = await get_groups_to_add(self.user_profile)
            logger.info(f"User {self.user.pk} connected, sending 'user_went_online' to {dialogs} dialog groups")
            for d in dialogs:  # type: int
                if str(d) != self.group_name:
                    await self.channel_layer.group_send(str(d), OutgoingEventWentOnline(user_pk=str(self.user.pk))._asdict())
        else:
            logger.info(f"Rejecting unauthenticated user with code {UNAUTH_REJECT_CODE}")
            await self.close(code=UNAUTH_REJECT_CODE)

    async def disconnect(self, close_code):
        """Handles WebSocket disconnections."""
        if close_code != UNAUTH_REJECT_CODE and getattr(self, 'user', None) is not None:
            logger.info(f"User {self.user.pk} disconnected, removing channel {self.channel_name} from group {self.group_name}")
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            dialogs = await get_groups_to_add(self.user_profile) 
            logger.info(f"User {self.user_profile.pk} disconnected, sending 'user_went_offline' to {dialogs} dialog groups")
            for d in dialogs:
                await self.channel_layer.group_send(str(d), OutgoingEventWentOffline(user_pk=str(self.user.pk))._asdict())

from asgiref.sync import sync_to_async

async def handle_text_message(self, data: MessageTypeTextMessage) -> Optional[ErrorDescription]:
    """Handles incoming text messages."""
    text = data['text']
    user_pk = data['user_pk']
    rid = data['random_id']
    recipient: Optional[UserProfile] = await get_user_by_pk(user_pk)

    if not recipient:
        return ErrorTypes.InvalidUserPk, f"User with pk {user_pk} does not exist"
    else:
        sender_profile = self.user_profile

        msg = await save_text_message(text, from_=sender_profile, to=recipient)
        await self._after_message_save(msg, rid=rid, user_pk=user_pk)
        await self.channel_layer.group_send(user_pk, OutgoingEventNewTextMessage(
            random_id=rid, text=text, sender=self.group_name, receiver=user_pk, sender_username=self.sender_username
        )._asdict())
    return None

async def handle_file_message(self, data: MessageTypeFileMessage) -> Optional[ErrorDescription]:
    """Handles incoming file messages."""
    file_id = data['file_id']
    user_pk = data['user_pk']
    rid = data['random_id']
    file: Optional[UploadedFile] = await get_file_by_id(file_id)

    if not file:
        return ErrorTypes.FileDoesNotExist, f"File with id {file_id} does not exist"
    else:
        recipient: Optional[UserProfile] = await get_user_by_pk(user_pk)
        if not recipient:
            return ErrorTypes.InvalidUserPk, f"User with pk {user_pk} does not exist"
        else:
            sender_profile = self.user_profile

            msg = await save_file_message(file, from_=sender_profile, to=recipient)
            await self._after_message_save(msg, rid=rid, user_pk=user_pk)
            await self.channel_layer.group_send(user_pk, OutgoingEventNewFileMessage(
                db_id=msg.id, file=serialize_file_model(file), sender=self.group_name, receiver=user_pk, sender_username=self.sender_username
            )._asdict())
    return None

async def handle_received_message(self, msg_type: MessageTypes, data: Dict[str, str]) -> Optional[ErrorDescription]:
    """Processes incoming messages based on their type."""
    logger.info(f"Received message type {msg_type.name} from user {self.group_name} with data {data}")
    
    if msg_type in [MessageTypes.WentOffline, MessageTypes.WentOnline, MessageTypes.MessageIdCreated, MessageTypes.ErrorOccurred]:
        logger.info(f"Ignoring message {msg_type.name}")
    elif msg_type == MessageTypes.IsTyping:
        dialogs = await get_groups_to_add(self.user_profile)  
        logger.info(f"User {self.user_profile.pk} is typing, sending 'is_typing' to {dialogs} dialog groups")
        for d in dialogs:
            if str(d) != self.group_name:
                await self.channel_layer.group_send(str(d), OutgoingEventIsTyping(user_pk=str(self.user_profile.pk))._asdict())
    elif msg_type == MessageTypes.TypingStopped:
        dialogs = await get_groups_to_add(self.user_profile) 
        logger.info(f"User {self.user_profile.pk} has stopped typing, sending 'stopped_typing' to {dialogs} dialog groups")
        for d in dialogs:
            if str(d) != self.group_name:
                await self.channel_layer.group_send(str(d), OutgoingEventStoppedTyping(user_pk=str(self.user_profile.pk))._asdict())
    elif msg_type == MessageTypes.MessageRead:
        return await self.handle_message_read(data)
    elif msg_type == MessageTypes.FileMessage:
        return await self.handle_file_message(data)
    elif msg_type == MessageTypes.TextMessage:
        return await self.handle_text_message(data)
    return None


async def receive(self, text_data):
    """Handles incoming WebSocket messages."""
    try:
        data = json.loads(text_data)
        logger.info(f"Received WebSocket message: {data}") # Debugging
        msg_type = MessageTypes(data['type'])
        error = await self.handle_received_message(msg_type, data)
        if error:
            error_type, error_message = error
            logger.error(f"Error processing message: {error_message}")
            await self.send(json.dumps({
                'type': MessageTypes.ErrorOccurred.name,
                'error_type': error_type.name,
                'error_message': error_message
            }))
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        await self.send(json.dumps({
            'type': MessageTypes.ErrorOccurred.name,
            'error_type': 'InternalError',
            'error_message': str(e)
        }))