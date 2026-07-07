"""Feature 6 — User Dashboard routes."""

import logging

from flask import Blueprint

from services import dashboard_service
from utils.auth_middleware import current_uid, require_auth
from utils.responses import success

logger = logging.getLogger("civicsathi.dashboard")

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/summary")
@require_auth
def summary():
    """Return aggregated counts and recent items for the user."""
    return success(data=dashboard_service.get_summary(current_uid()))
