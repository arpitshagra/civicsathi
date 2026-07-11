"""Unified interaction history.

Every AI generation (schemes, checklist, simplify, complaint) is logged to a
single ``history`` collection so it appears in the user's activity trail. This
is an automatic activity log and is distinct from user-initiated bookmarks
(``savedSchemes`` / ``savedChecklists`` / ``complaints``). The chat feature keeps
its own threaded ``chats`` collection.

Persistence is strictly best-effort: a failure here must never break the AI
response the user came for.
"""

import logging
from typing import Optional

from services import firebase_service

logger = logging.getLogger("civicsathi.history_service")

_COLLECTION = "history"

# Whitelist of features allowed in the history log.
_FEATURES = {"schemes", "checklist", "simplify", "complaint"}


def record(uid: str, feature: str, request_payload: dict, response_data: dict) -> Optional[str]:
    """Log a single user interaction snapshot to Firestore; returns document ID.

    Saves the user UID, feature key, request parameters, and response details.
    This operation is safe to fail (best-effort) and will swallow exceptions.
    """
    if feature not in _FEATURES:
        logger.debug("Skipping history for unknown feature '%s'.", feature)
        return None
    if not firebase_service.is_ready():
        return None
    try:
        return firebase_service.create_document(
            _COLLECTION,
            {
                "userId": uid,
                "feature": feature,
                "request": request_payload,
                "response": response_data,
            },
        )
    except Exception as exc:  # noqa: BLE001 - best-effort, never block
        logger.warning("Failed to record %s history for %s: %s", feature, uid, exc)
        return None


def list_history(uid: str, feature: Optional[str] = None, limit: Optional[int] = None) -> list:
    """List a user's interaction history logs, optionally filtered by a specific feature key."""
    if not firebase_service.is_ready():
        return []
    items = firebase_service.list_by_user(_COLLECTION, uid, limit=limit)
    if feature:
        items = [i for i in items if i.get("feature") == feature]
    return items
