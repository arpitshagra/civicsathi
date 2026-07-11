"""Feature 1 — AI Civic Assistant routes."""

import logging

from flask import Blueprint, request

from services import chat_service
from utils.auth_middleware import current_uid, require_auth, require_free_request
from utils.responses import success
from utils.validators import validate_chat

logger = logging.getLogger("civicsathi.chat")

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("")
@require_auth
@require_free_request
def chat():
    """Ask the civic assistant a question.
    
    1. Validates the chat message request body payload length and format.
    2. Invokes chat_service.handle_chat to generate a response (using Groq LLM).
    3. Saves conversation state and history under the user's current session UID.
    """
    payload = validate_chat(request.get_json(silent=True))
    data = chat_service.handle_chat(
        current_uid(), payload["message"], payload.get("chatId")
    )
    return success(data=data)


@chat_bp.get("/history")
@require_auth
def history():
    """List the user's conversation threads.
    
    Queries the database (Firebase) to return all chat sessions associated with the user's UID.
    """
    return success(data=chat_service.list_history(current_uid()))


@chat_bp.get("/<chat_id>")
@require_auth
def get_one(chat_id: str):
    """Fetch a single conversation thread by ID.
    
    Returns all previous prompts and responses within the selected thread.
    """
    return success(data=chat_service.get_chat(current_uid(), chat_id))


@chat_bp.delete("/<chat_id>")
@require_auth
def delete_one(chat_id: str):
    """Delete a conversation thread.
    
    Deletes the thread and all associated messages from the DB.
    """
    chat_service.delete_chat(current_uid(), chat_id)
    return success(message="deleted")
