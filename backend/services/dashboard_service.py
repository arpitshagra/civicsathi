"""Feature 6 — User Dashboard aggregation logic."""

import logging

from config import get_config
from services import firebase_service

logger = logging.getLogger("civicsathi.dashboard_service")


def get_summary(uid: str) -> dict:
    """Aggregate document counts and recent active threads/complaints for a user UID.
    
    1. Returns zeros/empty structures if Firebase service is not initialized.
    2. Runs count query tasks on chats, savedSchemes, savedChecklists, complaints, and general history lists.
    3. Fetches the most recent chats and complaints matching DASHBOARD_RECENT_LIMIT.
    """
    config = get_config()
    limit = config.DASHBOARD_RECENT_LIMIT

    if not firebase_service.is_ready():
        return {
            "counts": {
                "chats": 0,
                "savedSchemes": 0,
                "savedChecklists": 0,
                "complaints": 0,
                "history": 0,
            },
            "recentChats": [],
            "recentComplaints": [],
        }

    counts = {
        "chats": firebase_service.count_by_user("chats", uid),
        "savedSchemes": firebase_service.count_by_user("savedSchemes", uid),
        "savedChecklists": firebase_service.count_by_user("savedChecklists", uid),
        "complaints": firebase_service.count_by_user("complaints", uid),
        "history": firebase_service.count_by_user("history", uid),
    }

    recent_chats = firebase_service.list_by_user("chats", uid, limit=limit)
    recent_complaints = firebase_service.list_by_user("complaints", uid, limit=limit)

    return {
        "counts": counts,
        "recentChats": [
            {
                "chatId": c["id"],
                "title": c.get("title", "Conversation"),
                "updatedAt": c.get("updatedAt"),
            }
            for c in recent_chats
        ],
        "recentComplaints": [
            {
                "id": c["id"],
                "title": c.get("title", "Complaint"),
                "status": c.get("status", "Submitted"),
                "createdAt": c.get("createdAt"),
            }
            for c in recent_complaints
        ],
    }
