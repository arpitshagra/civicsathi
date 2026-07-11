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
    """Return aggregated stats and recent user documents.
    
    Queries dashboard_service.get_summary to aggregate the count of total
    conversations, saved checklists, filed complaints, simplified notifications,
    along with recent activity timelines.
    """
    return success(data=dashboard_service.get_summary(current_uid()))
