from channels.db import database_sync_to_async
from private_chat.models import MessageModel, DialogsModel, UploadedFile
from typing import Set, Awaitable, Optional, Tuple
from users_accounts.models import UserProfile
from django.core.exceptions import ValidationError
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Set the logging level
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',  # Log format
)

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_groups_to_add(user_profile: UserProfile) -> Awaitable[Set[int]]:
    """Fetches the IDs of users involved in dialogs with the given user."""
    dialogs = DialogsModel.get_dialogs_for_user(user_profile)
    user_ids = set()
    for dialog in dialogs:
        user_ids.add(dialog.user1.pk)
        user_ids.add(dialog.user2.pk)
    logger.info(f"Groups to add for user {user_profile.pk}: {user_ids}")  # Log the result
    return user_ids

@database_sync_to_async
def get_user_by_pk(pk: str) -> Awaitable[Optional[UserProfile]]:
    """Fetches a UserProfile instance by its linked User primary key."""
    user_profile = UserProfile.objects.filter(user__pk=pk).first()
    logger.info(f"Fetched user profile for pk={pk}: {user_profile}")  # Log the result
    return user_profile

@database_sync_to_async
def get_file_by_id(file_id: str) -> Awaitable[Optional[UploadedFile]]:
    """Fetches an UploadedFile instance by its ID."""
    try:
        file = UploadedFile.objects.filter(id=file_id).first()
        logger.info(f"Fetched file with id={file_id}: {file}")  # Log the result
    except ValidationError:
        file = None
        logger.error(f"Validation error fetching file with id={file_id}")  # Log the error
    return file

@database_sync_to_async
def get_message_by_id(mid: int) -> Awaitable[Optional[Tuple[str, str]]]:
    """Fetches a message by its ID and returns the recipient and sender IDs."""
    msg = MessageModel.objects.filter(id=mid).first()
    if msg:
        logger.info(f"Fetched message with id={mid}: sender={msg.sender.pk}, recipient={msg.recipient.pk}")  # Log the result
        return str(msg.recipient.pk), str(msg.sender.pk)
    else:
        logger.warning(f"Message with id={mid} not found")  # Log the warning
        return None

@database_sync_to_async
def mark_message_as_read(mid: int) -> Awaitable[None]:
    """Marks a message as read by updating its `read` field."""
    logger.info(f"Marking message with id={mid} as read")  # Log the operation
    return MessageModel.objects.filter(id=mid).update(read=True)

@database_sync_to_async
def get_unread_count(sender: UserProfile, recipient: UserProfile) -> Awaitable[int]:
    """Returns the count of unread messages between two users."""
    unread_count = int(MessageModel.get_unread_count_for_dialog_with_user(sender, recipient))
    logger.info(f"Unread count between sender={sender.pk} and recipient={recipient.pk}: {unread_count}")  # Log the result
    return unread_count

@database_sync_to_async
def save_text_message(text: str, from_: UserProfile, to: UserProfile) -> Awaitable[MessageModel]:
    """Saves a text message to the database."""
    logger.info(f"Saving text message: from={from_.pk}, to={to.pk}, text={text}")  # Log the operation
    if not text:
        raise ValueError("Text cannot be empty.")
    return MessageModel.objects.create(text=text, sender=from_, recipient=to)

@database_sync_to_async
def save_file_message(file: UploadedFile, from_: UserProfile, to: UserProfile) -> Awaitable[MessageModel]:
    """Saves a file message to the database."""
    logger.info(f"Saving file message: from={from_.pk}, to={to.pk}, file={file.id}")  # Log the operation
    return MessageModel.objects.create(file=file, sender=from_, recipient=to)