"""Authentication middleware.

Provides the ``@require_auth`` decorator that verifies the Firebase ID token on
the ``Authorization: Bearer <token>`` header and attaches the decoded user to
``flask.g.user``. All protected routes must use it.

For local development without live Firebase credentials, set
``AUTH_DISABLED=true`` to bypass verification and use a synthetic user. This is
logged loudly on startup and must NEVER be enabled in production.
"""

import functools
import logging

from flask import g, request

from config import get_config
from services import firebase_service
from utils.responses import APIError

logger = logging.getLogger("civicsathi.auth")

_DEV_USER = {
    "uid": "dev-user",
    "email": "dev@civicsathi.local",
    "name": "Development User",
    "picture": None,
}


def _extract_bearer_token() -> str:
    """Return the bearer token from the Authorization header, or raise 401."""
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise APIError(
            "Missing or malformed Authorization header.", 401, "UNAUTHORIZED"
        )
    token = header[len("Bearer ") :].strip()
    if not token:
        raise APIError("Empty authentication token.", 401, "UNAUTHORIZED")
    return token


def require_auth(view):
    """Decorator enforcing Firebase authentication on a Flask view."""

    @functools.wraps(view)
    def wrapper(*args, **kwargs):
        config = get_config()

        if config.AUTH_DISABLED:
            g.user = dict(_DEV_USER)
            return view(*args, **kwargs)

        token = _extract_bearer_token()
        try:
            decoded = firebase_service.verify_id_token(token)
        except RuntimeError as exc:
            # Firebase not initialised — a server configuration problem.
            logger.error("Auth attempted but Firebase is unavailable: %s", exc)
            raise APIError(
                "Authentication is not available.", 503, "AUTH_UNAVAILABLE"
            ) from exc
        except ValueError as exc:
            logger.info("Rejected invalid token: %s", exc)
            raise APIError("Invalid or expired token.", 401, "UNAUTHORIZED") from exc

        g.user = {
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "name": decoded.get("name"),
            "picture": decoded.get("picture"),
        }

        # Best-effort profile upsert; never blocks the request.
        firebase_service.upsert_user(g.user)
        return view(*args, **kwargs)

    return wrapper


def current_user() -> dict:
    """Return the authenticated user attached to the request context."""
    user = getattr(g, "user", None)
    if not user:
        raise APIError("No authenticated user in context.", 401, "UNAUTHORIZED")
    return user


def current_uid() -> str:
    """Return the authenticated user's UID."""
    return current_user()["uid"]
