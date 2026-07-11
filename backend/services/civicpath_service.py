"""Feature 7 — CivicPath AI business logic."""

import logging
from typing import List, Optional
from services import firebase_service, prompts
from services.ai_helpers import ai_generate
from utils.responses import APIError

logger = logging.getLogger("civicsathi.civicpath_service")

_COLLECTION = "missions"


def generate_questions(goal: str) -> dict:
    """Generate 3-4 custom questions relevant to the user's goal."""
    raw = ai_generate(
        prompts.CIVICPATH_QUESTIONS_PROMPT,
        prompts.build_civicpath_questions_prompt(goal),
    )
    # Ensure standard schema shape
    questions = raw.get("questions") or []
    return {"questions": questions}


def generate_roadmap(uid: str, goal: str, answers: dict) -> dict:
    """Generate the complete roadmap from goal and answers, and save to Firestore."""
    raw = ai_generate(
        prompts.CIVICPATH_ROADMAP_PROMPT,
        prompts.build_civicpath_roadmap_prompt(goal, answers),
    )
    
    steps = raw.get("steps") or []
    
    # Structure timeline grouping in Python (2 steps per week)
    timeline = []
    for i, s in enumerate(steps):
        step_id = s.get("id") or f"step_{i+1}"
        s["id"] = step_id
        s.setdefault("status", "Not Started")
        
        week_num = (i // 2) + 1
        week_label = f"Week {week_num}"
        
        found = False
        for t in timeline:
            if t["week"] == week_label:
                t["stepIds"].append(step_id)
                found = True
                break
        if not found:
            timeline.append({"week": week_label, "stepIds": [step_id]})

    # Generate reminders automatically in Python based on the steps checklist
    reminders = []
    for s in steps:
        if s.get("title"):
            reminders.append({
                "title": f"Apply for {s['title']}",
                "due": s.get("estimatedTime") or "Soon"
            })

    # Structure the database payload
    mission = {
        "userId": uid,
        "missionName": raw.get("missionName") or "My Mission",
        "goal": goal,
        "status": "In Progress",
        "progress": 0,
        "estimatedCost": raw.get("estimatedCost") or "₹0",
        "estimatedTime": raw.get("estimatedTime") or "Unknown",
        "difficulty": raw.get("difficulty") or "Medium",
        "potentialBenefits": raw.get("potentialBenefits") or "₹0",
        "steps": steps,
        "recommendations": raw.get("recommendations") or [],
        "timeline": timeline,
        "reminders": reminders,
        "documents": [], # vault uploaded list (stores document metadata)
        "startedAt": None,
        "completedAt": None
    }
    
    # Fill in server generated timestamp placeholder or actual
    if firebase_service.is_ready():
        from firebase_admin import firestore
        from datetime import datetime
        
        db_payload = dict(mission)
        db_payload["startedAt"] = firestore.SERVER_TIMESTAMP
        
        doc_id = firebase_service.create_document(_COLLECTION, db_payload)
        
        mission["startedAt"] = datetime.utcnow().isoformat() + "Z"
        mission["id"] = doc_id
        return mission
    else:
        # Graceful fallback offline mode
        mission["id"] = "offline-temp-id"
        return mission


def list_missions(uid: str) -> List[dict]:
    """Retrieve all missions for a user, newest first."""
    if not firebase_service.is_ready():
        return []
    return firebase_service.list_by_user(_COLLECTION, uid)


def get_mission(uid: str, mission_id: str) -> dict:
    """Retrieve a single mission details, verifying owner."""
    if not firebase_service.is_ready():
        raise APIError("Database is not ready.", 503, "DB_UNAVAILABLE")
    doc = firebase_service.get_document(_COLLECTION, mission_id)
    if doc is None or doc.get("userId") != uid:
        raise APIError("Mission not found.", 404, "NOT_FOUND")
    return doc


def update_mission(uid: str, mission_id: str, payload: dict) -> dict:
    """Update a mission document in Firestore."""
    if not firebase_service.is_ready():
        raise APIError("Database is not ready.", 503, "DB_UNAVAILABLE")
    
    existing = firebase_service.get_document(_COLLECTION, mission_id)
    if existing is None or existing.get("userId") != uid:
        raise APIError("Mission not found.", 404, "NOT_FOUND")
        
    # Prevent overriding userId
    payload.pop("userId", None)
    
    # If progress reaches 100%, set completedAt
    if payload.get("progress") == 100 and existing.get("progress") != 100:
        from firebase_admin import firestore
        payload["completedAt"] = firestore.SERVER_TIMESTAMP
        payload["status"] = "Completed"
    elif payload.get("progress", 0) < 100 and existing.get("progress") == 100:
        payload["completedAt"] = None
        payload["status"] = "In Progress"
        
    firebase_service.update_document(_COLLECTION, mission_id, payload)
    return firebase_service.get_document(_COLLECTION, mission_id)


def delete_mission(uid: str, mission_id: str) -> None:
    """Delete a mission."""
    if not firebase_service.is_ready():
        raise APIError("Database is not ready.", 503, "DB_UNAVAILABLE")
    doc = firebase_service.get_document(_COLLECTION, mission_id)
    if doc is None or doc.get("userId") != uid:
        raise APIError("Mission not found.", 404, "NOT_FOUND")
    firebase_service.delete_document(_COLLECTION, mission_id)
