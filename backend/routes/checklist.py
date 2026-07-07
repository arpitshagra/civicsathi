"""Feature 3 — Document Checklist Generator routes."""

import logging

from flask import Blueprint, request

from services import checklist_service
from utils.auth_middleware import current_uid, require_auth
from utils.responses import APIError, success
from utils.validators import require_json, require_str, validate_checklist

logger = logging.getLogger("civicsathi.checklist")

checklist_bp = Blueprint("checklist", __name__)


@checklist_bp.post("")
@require_auth
def generate():
    """Generate a document/eligibility checklist for a service."""
    payload = validate_checklist(request.get_json(silent=True))
    return success(data=checklist_service.generate_checklist(current_uid(), payload["service"]))


@checklist_bp.post("/save")
@require_auth
def save():
    """Save a checklist to the user's collection."""
    body = require_json(request.get_json(silent=True))
    service = require_str(body, "service", 120)
    checklist = body.get("checklist")
    if not isinstance(checklist, dict):
        raise APIError("'checklist' object is required.", 400, "INVALID_FIELD")
    doc_id = checklist_service.save_checklist(current_uid(), service, checklist)
    return success(data={"id": doc_id}, message="saved", status=201)


@checklist_bp.get("/saved")
@require_auth
def saved():
    """List the user's saved checklists."""
    return success(data=checklist_service.list_saved(current_uid()))


@checklist_bp.delete("/saved/<doc_id>")
@require_auth
def delete_saved(doc_id: str):
    """Remove a saved checklist."""
    checklist_service.delete_saved(current_uid(), doc_id)
    return success(message="deleted")
