from .models import MessageModel, DialogsModel, UploadedFile
from users_accounts.models import UserProfile
from typing import Optional, Dict
import os


def serialize_file_model(m: UploadedFile) -> Dict[str, str]:
    if not m.file:
        return None
    return {
        'id': str(m.id),
        'url': m.file.url,
        'size': m.file.size,
        'name': os.path.basename(m.file.name)
    }


def serialize_message_model(m: MessageModel, user_id: int) -> Dict[str, any]:
    if not m.sender or not m.recipient:
        return None
    sender_pk = m.sender.user.pk
    recipient_pk = m.recipient.user.pk
    is_out = sender_pk == user_id
    print(f"Sender PK: {sender_pk}, Recipient PK: {recipient_pk}, User ID: {user_id}, Out: {is_out}") 
    return {
        "id": m.id,
        "text": m.text,
        "sent": int(m.created.timestamp()),
        "edited": int(m.modified.timestamp()),
        "read": m.read,
        "file": serialize_file_model(m.file) if m.file else None,
        "sender": str(sender_pk),
        "recipient": str(recipient_pk),
        "out": is_out,
        "sender_username": m.sender.user.username,
        "recipient_username": m.recipient.user.username
    }


def serialize_dialog_model(m: DialogsModel, user_id: int) -> Dict[str, any]:
    if not m.user1 or not m.user2:
        return None
    username_field = "user__username"
    other_user_pk, other_user_username = (
        UserProfile.objects.filter(pk=m.user1.pk)
        .values_list('pk', username_field)
        .first()
        if m.user2.pk == user_id
        else UserProfile.objects.filter(pk=m.user2.pk).values_list('pk', username_field).first()
    )
    unread_count = MessageModel.get_unread_count_for_dialog_with_user(
        sender=other_user_pk, recipient=user_id
    )
    last_message: Optional[MessageModel] = MessageModel.get_last_message_for_dialog(
        sender=other_user_pk, recipient=user_id
    )
    last_message_ser = serialize_message_model(last_message, user_id) if last_message else None
    return {
        "id": m.id,
        "created": int(m.created.timestamp()),
        "modified": int(m.modified.timestamp()),
        "other_user_id": str(other_user_pk),
        "unread_count": unread_count,
        "username": other_user_username,
        "last_message": last_message_ser
    }


def serialize_user_model(user: UserProfile) -> Dict[str, Optional[str]]:
    if not user:
        return None
    return {
        "id": str(user.id),
        "username": user.user.username,
        "full_name": user.full_name,
        "profile_image": user.profile_image.url if user.profile_image else "/static/profile/default.jpg",
    }