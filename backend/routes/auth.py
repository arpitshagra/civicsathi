"""Auth blueprint — verify the caller and return their profile."""

from flask import Blueprint

from utils.auth_middleware import current_user, require_auth
from utils.responses import success

auth_bp = Blueprint("auth", __name__)


@auth_bp.get("/me")
@require_auth
def me():
    """Return the authenticated user's profile.
    
    Acts as a token check. If the Authorization bearer token is valid,
    resolves the user object (uid, email, request counts) and returns it.
    """
    return success(data=current_user(), message="authenticated")
