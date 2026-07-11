"""Feature 1 — AI Civic Assistant business logic.

Generates a structured assistant answer via Groq and persists the conversation
to Firestore (best-effort). Persistence failures never block the AI response.
"""

import logging
from typing import Optional

from models import schemas
from services import firebase_service, prompts
from services.ai_helpers import ai_generate
from utils.responses import APIError

logger = logging.getLogger("civicsathi.chat_service")

_COLLECTION = "chats"


def _generate_answer(message: str) -> dict:
    """Call Groq and normalise the assistant answer.
    
    Uses CHAT_SYSTEM_PROMPT to command the assistant's context and personality.
    Returns standard schemas.normalize_assistant format dict.
    """
    raw = ai_generate(
        prompts.CHAT_SYSTEM_PROMPT,
        prompts.build_chat_prompt(message),
    )
    return schemas.normalize_assistant(raw)


def _persist(uid: str, message: str, answer: dict, chat_id: Optional[str]) -> Optional[str]:
    """Persist the exchange; returns the chat id, or None if database is unavailable.
    
    If chat_id is passed, appends the messages to the existing document in Firestore.
    Otherwise, creates a new chat document. Fails gracefully to let the chat run
    offline even if DB fails.
    """
    if not firebase_service.is_ready():
        return chat_id

    # Construct chat message entities
    user_msg = {"role": "user", "content": message}
    assistant_msg = {"role": "assistant", "content": answer.get("answer", ""), "structured": answer}

    try:
        if chat_id:
            # Append exchange to existing conversation log
            existing = firebase_service.get_document(_COLLECTION, chat_id)
            if existing is None or existing.get("userId") != uid:
                raise APIError("Conversation not found.", 404, "NOT_FOUND")
            messages = existing.get("messages") or []
            messages.extend([user_msg, assistant_msg])
            firebase_service.update_document(_COLLECTION, chat_id, {"messages": messages})
            return chat_id

        # Generate a new conversation document. Title is truncated from first message
        title = (message[:60] + "…") if len(message) > 60 else message
        return firebase_service.create_document(
            _COLLECTION,
            {"userId": uid, "title": title, "messages": [user_msg, assistant_msg]},
        )
    except APIError:
        raise
    except Exception as exc:  # noqa: BLE001 - persistence is best-effort
        logger.warning("Failed to persist chat for %s: %s", uid, exc)
        return chat_id


def handle_chat(uid: str, message: str, chat_id: Optional[str] = None) -> dict:
    """Generate an assistant answer, persist the exchange to Firebase, and return results.
    
    Acts as the entrypoint for route handling.
    """
    answer = _generate_answer(message)
    saved_chat_id = _persist(uid, message, answer, chat_id)
    return {**answer, "chatId": saved_chat_id}


def list_history(uid: str) -> list:
    """Return all conversation threads owned by the user (metadata details only).
    
    Returns minimal payload objects for sidebar list render performance.
    """
    if not firebase_service.is_ready():
        return []
    chats = firebase_service.list_by_user(_COLLECTION, uid)
    return [
        {
            "chatId": c["id"],
            "title": c.get("title", "Conversation"),
            "messageCount": len(c.get("messages") or []),
            "createdAt": c.get("createdAt"),
            "updatedAt": c.get("updatedAt"),
        }
        for c in chats
    ]


def get_chat(uid: str, chat_id: str) -> dict:
    """Return a full conversation thread (prompts + responses) owned by the user."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    chat = firebase_service.get_document(_COLLECTION, chat_id)
    if chat is None or chat.get("userId") != uid:
        raise APIError("Conversation not found.", 404, "NOT_FOUND")
    return chat


def delete_chat(uid: str, chat_id: str) -> None:
    """Delete a conversation thread matching chat_id from Firebase."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    chat = firebase_service.get_document(_COLLECTION, chat_id)
    if chat is None or chat.get("userId") != uid:
        raise APIError("Conversation not found.", 404, "NOT_FOUND")
    firebase_service.delete_document(_COLLECTION, chat_id)
