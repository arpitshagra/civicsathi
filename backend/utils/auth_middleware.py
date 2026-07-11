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
    """Return the bearer token from the Authorization header, or raise 401.
    
    Expects header of format "Bearer <firebase_id_token>".
    """
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
    """Decorator enforcing Firebase authentication on a Flask view.
    
    Checks config.AUTH_DISABLED to allow local bypass with a static dev user.
    Otherwise, extracts and verifies the Firebase ID token, parses user profile info,
    and updates the user document in Firebase Firestore.
    """

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


def require_free_request(view):
    """Consume one of the authenticated account's free AI requests.
    
    Verifies that the user has not exceeded their FREE_REQUEST_LIMIT.
    Updates Firestore atomically. Raises 429 if the request quota is exhausted.
    """

    @functools.wraps(view)
    def wrapper(*args, **kwargs):
        config = get_config()
        try:
            usage = firebase_service.consume_free_request(
                current_uid(), config.FREE_REQUEST_LIMIT
            )
        except RuntimeError as exc:
            logger.error("Request limit check unavailable: %s", exc)
            raise APIError(
                "Request limit service is not available.",
                503,
                "LIMIT_UNAVAILABLE",
            ) from exc

        if not usage["allowed"]:
            raise APIError(
                f"You have used all {usage['limit']} free AI requests for this account.",
                429,
                "FREE_REQUEST_LIMIT_REACHED",
                usage,
            )

        g.request_usage = usage
        return view(*args, **kwargs)

    return wrapper


def current_user() -> dict:
    """Return the authenticated user attached to the current request context.
    
    Raises 401 if request has not gone through require_auth decorator.
    """
    user = getattr(g, "user", None)
    if not user:
        raise APIError("No authenticated user in context.", 401, "UNAUTHORIZED")
    return user


def current_uid() -> str:
    """Return the authenticated user's UID string from the current session."""
    return current_user()["uid"]
