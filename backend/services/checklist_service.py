"""Feature 3 — Document Checklist Generator business logic."""

import logging

from models import schemas
from services import firebase_service, history_service, prompts
from services.ai_helpers import ai_generate
from utils.responses import APIError

logger = logging.getLogger("civicsathi.checklist_service")

_COLLECTION = "savedChecklists"


def generate_checklist(uid: str, service: str) -> dict:
    """Generate a document checklist for a government service."""
    raw = ai_generate(
        prompts.CHECKLIST_SYSTEM_PROMPT,
        prompts.build_checklist_prompt(service),
    )
    result = schemas.normalize_checklist(raw, service=service)
    history_id = history_service.record(uid, "checklist", {"service": service}, result)
    return {**result, "historyId": history_id}


def save_checklist(uid: str, service: str, checklist: dict) -> str:
    """Persist a checklist the user chose to save."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    if not isinstance(checklist, dict):
        raise APIError("A valid 'checklist' object is required.", 400, "INVALID_FIELD")
    return firebase_service.create_document(
        _COLLECTION,
        {
            "userId": uid,
            "service": service,
            "checklist": schemas.normalize_checklist(checklist, service=service),
        },
    )


def list_saved(uid: str) -> list:
    """List the user's saved checklists."""
    if not firebase_service.is_ready():
        return []
    return firebase_service.list_by_user(_COLLECTION, uid)


def delete_saved(uid: str, doc_id: str) -> None:
    """Delete a saved checklist owned by the user."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    doc = firebase_service.get_document(_COLLECTION, doc_id)
    if doc is None or doc.get("userId") != uid:
        raise APIError("Saved checklist not found.", 404, "NOT_FOUND")
    firebase_service.delete_document(_COLLECTION, doc_id)
