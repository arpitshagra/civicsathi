"""Feature 5 — AI Complaint Generator routes."""

import logging

from flask import Blueprint, request

from services import complaint_service
from utils.auth_middleware import current_uid, require_auth, require_free_request
from utils.responses import APIError, success
from utils.validators import optional_str, require_json, validate_complaint

logger = logging.getLogger("civicsathi.complaint")

complaint_bp = Blueprint("complaint", __name__)


@complaint_bp.post("")
@require_auth
@require_free_request
def generate():
    """Generate a structured complaint from a raw issue description.
    
    1. Validates that the input contains a valid issue description and location.
    2. Invokes complaint_service.generate_complaint to use LLM parsing to categorize
       the issue, identify the responsible department, flag priority level, and draft a formal letter.
    """
    payload = validate_complaint(request.get_json(silent=True))
    data = complaint_service.generate_complaint(
        current_uid(), payload["description"], payload["location"]
    )
    return success(data=data)


@complaint_bp.post("/save")
@require_auth
def save():
    """Save/file a structured complaint to the user's history folder.
    
    Extracts the normalized complaint object and optional location, validates structure,
    and inserts it into Firebase Firestore.
    """
    body = require_json(request.get_json(silent=True))
    complaint = body.get("complaint")
    if not isinstance(complaint, dict):
        raise APIError("'complaint' object is required.", 400, "INVALID_FIELD")
    location = optional_str(body, "location", 200)
    doc_id = complaint_service.save_complaint(current_uid(), complaint, location)
    return success(data={"id": doc_id}, message="saved", status=201)


@complaint_bp.get("/history")
@require_auth
def history():
    """List the user's filed complaints.
    
    Returns all previous complaints lodged or saved by the current user UID.
    """
    return success(data=complaint_service.list_history(current_uid()))


@complaint_bp.delete("/<doc_id>")
@require_auth
def delete_one(doc_id: str):
    """Delete a complaint from the database.
    
    Deletes the Firestore record matching doc_id under the user's namespace.
    """
    complaint_service.delete_complaint(current_uid(), doc_id)
    return success(message="deleted")
