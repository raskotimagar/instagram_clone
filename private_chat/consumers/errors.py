import enum
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class ErrorTypes(enum.IntEnum):
    MessageParsingError = 1
    TextMessageInvalid = 2
    InvalidMessageReadId = 3
    InvalidUserPk = 4
    InvalidRandomId = 5
    FileMessageInvalid = 6
    FileDoesNotExist = 7

    @property
    def message(self):
        messages = {
            ErrorTypes.MessageParsingError: "Failed to parse the incoming message.",
            ErrorTypes.TextMessageInvalid: "The text message is invalid.",
            ErrorTypes.InvalidMessageReadId: "The message ID for marking as read is invalid.",
            ErrorTypes.InvalidUserPk: "The user primary key is invalid or does not exist.",
            ErrorTypes.InvalidRandomId: "The random ID is invalid.",
            ErrorTypes.FileMessageInvalid: "The file message is invalid.",
            ErrorTypes.FileDoesNotExist: "The file does not exist in the database.",
        }
        return messages[self]


ErrorDescription = Tuple[ErrorTypes, str]


def create_error(error_type: ErrorTypes, custom_message: str = None) -> ErrorDescription:
    """Creates an ErrorDescription tuple."""
    return error_type, custom_message or error_type.message


def log_error(error: ErrorDescription):
    """Logs an error."""
    error_type, message = error
    logger.error(f"{error_type.name}: {message}")