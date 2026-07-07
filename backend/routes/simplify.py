"""Feature 4 — Government Notification Simplifier routes."""

import logging

from flask import Blueprint, request

from services import simplify_service
from utils.auth_middleware import current_uid, require_auth, require_free_request
from utils.responses import success
from utils.validators import validate_simplify

logger = logging.getLogger("civicsathi.simplify")

simplify_bp = Blueprint("simplify", __name__)


@simplify_bp.post("")
@require_auth
@require_free_request
def simplify():
    """Simplify a long government notification into plain language."""
    payload = validate_simplify(request.get_json(silent=True))
    return success(data=simplify_service.simplify_notification(current_uid(), payload["text"]))
