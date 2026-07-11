"""Feature 2 — Scheme Eligibility Finder routes."""

import logging

from flask import Blueprint, request

from services import schemes_service
from utils.auth_middleware import current_uid, require_auth, require_free_request
from utils.responses import APIError, success
from utils.validators import require_json, validate_schemes

logger = logging.getLogger("civicsathi.schemes")

schemes_bp = Blueprint("schemes", __name__)


@schemes_bp.post("")
@require_auth
@require_free_request
def find():
    """Recommend eligible schemes for a citizen profile description.
    
    1. Validates the profile (age, gender, income, state, etc.) inputs.
    2. Invokes schemes_service.find_schemes to retrieve matched schemes using Groq.
    """
    profile = validate_schemes(request.get_json(silent=True))
    return success(data=schemes_service.find_schemes(current_uid(), profile))


@schemes_bp.post("/save")
@require_auth
def save():
    """Save a scheme suggestion to the user's personal collection.
    
    Takes the scheme detail dictionary and profile snap shot, and records it to Firestore.
    """
    body = require_json(request.get_json(silent=True))
    scheme = body.get("scheme")
    if not isinstance(scheme, dict):
        raise APIError("'scheme' object is required.", 400, "INVALID_FIELD")
    profile_snapshot = body.get("profileSnapshot") if isinstance(body.get("profileSnapshot"), dict) else {}
    doc_id = schemes_service.save_scheme(current_uid(), scheme, profile_snapshot)
    return success(data={"id": doc_id}, message="saved", status=201)


@schemes_bp.get("/saved")
@require_auth
def saved():
    """List the user's saved schemes.
    
    Queries Firestore to fetch all scheme recommendations saved by this user UID.
    """
    return success(data=schemes_service.list_saved(current_uid()))


@schemes_bp.delete("/saved/<doc_id>")
@require_auth
def delete_saved(doc_id: str):
    """Remove a saved scheme.
    
    Deletes the scheme record matching doc_id under the user's namespace.
    """
    schemes_service.delete_saved(current_uid(), doc_id)
    return success(message="deleted")
