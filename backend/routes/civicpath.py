"""Feature 7 — CivicPath AI (Roadmap Generator) routes."""

import logging
from flask import Blueprint, request
from services import civicpath_service
from utils.auth_middleware import current_uid, require_auth, require_free_request
from utils.responses import success
from utils.validators import validate_goal, validate_answers, require_json

logger = logging.getLogger("civicsathi.civicpath")

civicpath_bp = Blueprint("civicpath", __name__)


@civicpath_bp.post("/questions")
@require_auth
def questions():
    """Generate 3-4 custom questions relevant to the user's goal."""
    goal = validate_goal(request.get_json(silent=True))
    data = civicpath_service.generate_questions(goal)
    return success(data=data)


@civicpath_bp.post("/generate")
@require_auth
@require_free_request
def generate():
    """Generate a complete roadmap and save to Firestore, consuming a free request."""
    body = require_json(request.get_json(silent=True))
    goal = validate_goal(body)
    answers = validate_answers(body)
    data = civicpath_service.generate_roadmap(current_uid(), goal, answers)
    return success(data=data, message="Roadmap generated successfully.")


@civicpath_bp.get("/missions")
@require_auth
def list_missions():
    """Retrieve all user missions."""
    data = civicpath_service.list_missions(current_uid())
    return success(data=data)


@civicpath_bp.get("/missions/<mission_id>")
@require_auth
def get_mission(mission_id: str):
    """Retrieve details of a specific mission."""
    data = civicpath_service.get_mission(current_uid(), mission_id)
    return success(data=data)


@civicpath_bp.put("/missions/<mission_id>")
@require_auth
def update_mission(mission_id: str):
    """Update details of a specific mission (e.g. mark step completed)."""
    payload = require_json(request.get_json(silent=True))
    data = civicpath_service.update_mission(current_uid(), mission_id, payload)
    return success(data=data, message="Mission updated successfully.")


@civicpath_bp.delete("/missions/<mission_id>")
@require_auth
def delete_mission(mission_id: str):
    """Delete a mission."""
    civicpath_service.delete_mission(current_uid(), mission_id)
    return success(message="Mission deleted successfully.")
