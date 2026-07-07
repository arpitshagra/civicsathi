"""Feature 5 — AI Complaint Generator business logic.

v1 classifies complaints from a text description (optionally with a location).
Image uploads are out of scope for this version; the API accepts a description
and returns a structured, ready-to-file complaint.
"""

import logging

from models import schemas
from services import firebase_service, history_service, prompts
from services.ai_helpers import ai_generate
from utils.responses import APIError

logger = logging.getLogger("civicsathi.complaint_service")

_COLLECTION = "complaints"


def generate_complaint(uid: str, description: str, location: str = "") -> dict:
    """Classify a civic issue and draft a structured complaint."""
    raw = ai_generate(
        prompts.COMPLAINT_SYSTEM_PROMPT,
        prompts.build_complaint_prompt(description, location),
    )
    result = schemas.normalize_complaint(raw)
    history_id = history_service.record(
        uid, "complaint", {"description": description, "location": location}, result
    )
    return {**result, "historyId": history_id}


def save_complaint(uid: str, complaint: dict, location: str = "") -> str:
    """Persist a complaint the user chose to file/track."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    if not isinstance(complaint, dict) or not complaint.get("title"):
        raise APIError("A valid 'complaint' object is required.", 400, "INVALID_FIELD")
    normalized = schemas.normalize_complaint(complaint)
    return firebase_service.create_document(
        _COLLECTION,
        {
            "userId": uid,
            "location": location or "",
            "status": "Submitted",
            **normalized,
        },
    )


def list_history(uid: str) -> list:
    """List the user's complaint history."""
    if not firebase_service.is_ready():
        return []
    return firebase_service.list_by_user(_COLLECTION, uid)


def delete_complaint(uid: str, doc_id: str) -> None:
    """Delete a complaint owned by the user."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    doc = firebase_service.get_document(_COLLECTION, doc_id)
    if doc is None or doc.get("userId") != uid:
        raise APIError("Complaint not found.", 404, "NOT_FOUND")
    firebase_service.delete_document(_COLLECTION, doc_id)
