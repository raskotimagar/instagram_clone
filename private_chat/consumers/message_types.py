import enum
import json
from typing import NamedTuple, Optional, Dict, TypedDict


class MessageTypeTextMessage(TypedDict):
    """Represents an incoming text message."""
    text: str
    user_pk: str
    random_id: int


class MessageTypeMessageRead(TypedDict):
    """Represents an incoming message read event."""
    user_pk: str
    message_id: int


class MessageTypeFileMessage(TypedDict):
    """Represents an incoming file message."""
    file_id: str
    user_pk: str
    random_id: int


class MessageTypes(enum.IntEnum):
    """Defines the types of messages that can be sent or received."""
    WentOnline = 1
    WentOffline = 2
    TextMessage = 3
    FileMessage = 4
    IsTyping = 5
    MessageRead = 6
    ErrorOccurred = 7
    MessageIdCreated = 8
    NewUnreadCount = 9
    TypingStopped = 10


class OutgoingEventMessageRead(NamedTuple):
    """Represents a message read event."""
    message_id: int
    sender: str
    receiver: str
    type: str = "message_read"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.MessageRead,
            "message_id": self.message_id,
            "sender": self.sender,
            "receiver": self.receiver
        })


class OutgoingEventNewTextMessage(NamedTuple):
    """Represents a new text message event."""
    random_id: int
    text: str
    sender: str
    receiver: str
    sender_username: str
    type: str = "new_text_message"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.TextMessage,
            "random_id": self.random_id,
            "text": self.text,
            "sender": self.sender,
            "receiver": self.receiver,
            "sender_username": self.sender_username,
        })


class OutgoingEventNewFileMessage(NamedTuple):
    """Represents a new file message event."""
    db_id: int
    file: Dict[str, str]
    sender: str
    receiver: str
    sender_username: str
    type: str = "new_file_message"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.FileMessage,
            "db_id": self.db_id,
            "file": self.file,
            "sender": self.sender,
            "receiver": self.receiver,
            "sender_username": self.sender_username,
        })


class OutgoingEventNewUnreadCount(NamedTuple):
    """Represents an update to the unread message count."""
    sender: str
    unread_count: int
    type: str = "new_unread_count"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.NewUnreadCount,
            "sender": self.sender,
            "unread_count": self.unread_count,
        })


class OutgoingEventMessageIdCreated(NamedTuple):
    """Represents a message ID creation event."""
    random_id: int
    db_id: int
    type: str = "message_id_created"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.MessageIdCreated,
            "random_id": self.random_id,
            "db_id": self.db_id,
        })


class OutgoingEventIsTyping(NamedTuple):
    """Represents a typing indicator event."""
    user_pk: str
    type: str = "is_typing"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.IsTyping,
            "user_pk": self.user_pk
        })


class OutgoingEventStoppedTyping(NamedTuple):
    """Represents a stopped typing event."""
    user_pk: str
    type: str = "stopped_typing"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.TypingStopped,
            "user_pk": self.user_pk
        })


class OutgoingEventWentOnline(NamedTuple):
    """Represents a user coming online event."""
    user_pk: str
    type: str = "user_went_online"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.WentOnline,
            "user_pk": self.user_pk
        })


class OutgoingEventWentOffline(NamedTuple):
    """Represents a user going offline event."""
    user_pk: str
    type: str = "user_went_offline"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.WentOffline,
            "user_pk": self.user_pk
        })


class OutgoingEventErrorOccurred(NamedTuple):
    """Represents an error event."""
    error_type: str
    error_message: str
    type: str = "error_occurred"

    def to_json(self) -> str:
        """Serializes the event to JSON."""
        return json.dumps({
            "msg_type": MessageTypes.ErrorOccurred,
            "error_type": self.error_type,
            "error_message": self.error_message,
        })