"""Feature 2 — Scheme Eligibility Finder business logic."""

import logging

from models import schemas
from services import firebase_service, history_service, prompts
from services.ai_helpers import ai_generate
from utils.responses import APIError

logger = logging.getLogger("civicsathi.schemes_service")

_COLLECTION = "savedSchemes"


def find_schemes(uid: str, profile: dict) -> dict:
    """Recommend eligible schemes for a validated citizen profile."""
    raw = ai_generate(
        prompts.SCHEMES_SYSTEM_PROMPT,
        prompts.build_schemes_prompt(profile),
    )
    result = schemas.normalize_schemes(raw)
    history_id = history_service.record(uid, "schemes", profile, result)
    return {**result, "historyId": history_id}


def save_scheme(uid: str, scheme: dict, profile_snapshot: dict) -> str:
    """Persist a scheme the user chose to save."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    if not isinstance(scheme, dict) or not scheme.get("name"):
        raise APIError("A valid 'scheme' object is required.", 400, "INVALID_FIELD")
    return firebase_service.create_document(
        _COLLECTION,
        {
            "userId": uid,
            "scheme": schemas._normalize_scheme(scheme),
            "profileSnapshot": profile_snapshot or {},
        },
    )


def list_saved(uid: str) -> list:
    """List the user's saved schemes."""
    if not firebase_service.is_ready():
        return []
    return firebase_service.list_by_user(_COLLECTION, uid)


def delete_saved(uid: str, doc_id: str) -> None:
    """Delete a saved scheme owned by the user."""
    if not firebase_service.is_ready():
        raise APIError("Persistence is not available.", 503, "DB_UNAVAILABLE")
    doc = firebase_service.get_document(_COLLECTION, doc_id)
    if doc is None or doc.get("userId") != uid:
        raise APIError("Saved scheme not found.", 404, "NOT_FOUND")
    firebase_service.delete_document(_COLLECTION, doc_id)
