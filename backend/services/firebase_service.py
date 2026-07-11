"""Firebase Admin initialisation, auth verification, and Firestore repository.

Firebase is initialised once at application startup. Credentials are provided
either as a path to a service-account JSON file or as inline JSON via
environment variables.

This module also exposes a thin, generic Firestore data-access layer used by
the feature services (create / get / list-by-user / delete / count). All
collections in CivicSathi are owned by a single user via a ``userId`` field,
so every query is scoped by that field.
"""

import json
import logging
from typing import List, Optional

import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials, firestore

logger = logging.getLogger("civicsathi.firebase")

_db = None  # Lazily-populated Firestore client handle.


# ---------------------------------------------------------------------------
# Initialisation
# ---------------------------------------------------------------------------

def _build_credentials(config) -> Optional[credentials.Base]:
    """Build Firebase credentials certificate from configuration, if available.
    
    Tries config.FIREBASE_CREDENTIALS_JSON first, falling back to config.FIREBASE_CREDENTIALS_PATH.
    Returns None if neither is set or if credentials parsing fails.
    """
    if config.FIREBASE_CREDENTIALS_JSON:
        try:
            info = json.loads(config.FIREBASE_CREDENTIALS_JSON)
            return credentials.Certificate(info)
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Invalid FIREBASE_CREDENTIALS_JSON: %s", exc)
            return None

    if config.FIREBASE_CREDENTIALS_PATH:
        try:
            return credentials.Certificate(config.FIREBASE_CREDENTIALS_PATH)
        except (FileNotFoundError, ValueError) as exc:
            logger.error("Invalid FIREBASE_CREDENTIALS_PATH: %s", exc)
            return None

    return None


def init_firebase(config) -> None:
    """Initialise the Firebase Admin SDK.

    Safe to call multiple times; initialisation only happens once. If no
    credentials are configured, initialisation is skipped and a warning is
    logged so the app can still boot (e.g. for local UI development).
    """
    global _db

    if firebase_admin._apps:
        logger.debug("Firebase already initialised; skipping.")
        return

    cred = _build_credentials(config)
    if cred is None:
        logger.warning(
            "Firebase credentials not configured; auth and persistence disabled."
        )
        return

    try:
        options = {}
        if config.FIREBASE_PROJECT_ID:
            options["projectId"] = config.FIREBASE_PROJECT_ID
        firebase_admin.initialize_app(cred, options or None)
        _db = firestore.client()
        logger.info("Firebase initialised successfully.")
    except Exception as exc:  # noqa: BLE001 - log and continue on boot
        logger.exception("Failed to initialise Firebase: %s", exc)


def get_db():
    """Return the Firestore client, or None if Firebase is not initialised."""
    return _db


def is_ready() -> bool:
    """Return True when Firestore persistence is available."""
    return _db is not None


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

def verify_id_token(id_token: str) -> dict:
    """Verify a Firebase ID token and return its decoded claims.

    Raises:
        RuntimeError: If Firebase is not initialised.
        ValueError: If the token is invalid or expired.
    """
    if not firebase_admin._apps:
        raise RuntimeError("Firebase is not initialised.")
    try:
        return fb_auth.verify_id_token(id_token)
    except Exception as exc:  # noqa: BLE001 - normalise to ValueError
        raise ValueError(f"Invalid authentication token: {exc}") from exc


# ---------------------------------------------------------------------------
# Firestore repository (generic, user-scoped)
# ---------------------------------------------------------------------------

def _require_db():
    """Return the Firestore client or raise if unavailable."""
    if _db is None:
        raise RuntimeError("Firestore is not available.")
    return _db


def create_document(collection: str, data: dict) -> str:
    """Create a document in Firestore with a server-generated ID and return that ID.

    ``createdAt`` / ``updatedAt`` server timestamps are added automatically.
    """
    db = _require_db()
    payload = dict(data)
    payload.setdefault("createdAt", firestore.SERVER_TIMESTAMP)
    payload["updatedAt"] = firestore.SERVER_TIMESTAMP
    ref = db.collection(collection).document()
    ref.set(payload)
    return ref.id


def set_document(collection: str, doc_id: str, data: dict, merge: bool = True) -> None:
    """Create or update a document with an explicit id.
    
    Updates the ``updatedAt`` server timestamp on set.
    """
    db = _require_db()
    payload = dict(data)
    payload["updatedAt"] = firestore.SERVER_TIMESTAMP
    db.collection(collection).document(doc_id).set(payload, merge=merge)


def update_document(collection: str, doc_id: str, data: dict) -> None:
    """Update specific fields on an existing document in Firestore."""
    db = _require_db()
    payload = dict(data)
    payload["updatedAt"] = firestore.SERVER_TIMESTAMP
    db.collection(collection).document(doc_id).update(payload)


def get_document(collection: str, doc_id: str) -> Optional[dict]:
    """Fetch a single document by ID as a dict (with ``id`` included), or None if missing."""
    db = _require_db()
    snap = db.collection(collection).document(doc_id).get()
    if not snap.exists:
        return None
    data = snap.to_dict() or {}
    data["id"] = snap.id
    return data


def list_by_user(
    collection: str,
    user_id: str,
    order_by: str = "createdAt",
    descending: bool = True,
    limit: Optional[int] = None,
) -> List[dict]:
    """List documents owned by ``user_id``, newest first by default.

    Falls back to an unordered query if the ordering index is unavailable, so
    the API degrades gracefully before composite indexes are created.
    """
    db = _require_db()
    base = db.collection(collection).where("userId", "==", user_id)
    try:
        direction = firestore.Query.DESCENDING if descending else firestore.Query.ASCENDING
        query = base.order_by(order_by, direction=direction)
        if limit:
            query = query.limit(limit)
        docs = query.stream()
    except Exception as exc:  # noqa: BLE001 - missing index / field
        logger.warning(
            "Ordered query on %s failed (%s); falling back to unordered.",
            collection,
            exc,
        )
        query = base.limit(limit) if limit else base
        docs = query.stream()

    results = []
    for snap in docs:
        data = snap.to_dict() or {}
        data["id"] = snap.id
        results.append(data)
    return results


def count_by_user(collection: str, user_id: str) -> int:
    """Count documents owned by ``user_id`` by streaming and counting records."""
    db = _require_db()
    docs = db.collection(collection).where("userId", "==", user_id).stream()
    return sum(1 for _ in docs)


def delete_document(collection: str, doc_id: str) -> None:
    """Delete a document matching doc_id from Firestore."""
    db = _require_db()
    db.collection(collection).document(doc_id).delete()


def upsert_user(user: dict) -> None:
    """Create or update the user profile document (best-effort).
    
    Saves/updates profile information derived from Firebase Auth claims (Google Sign-In).
    """
    if _db is None:
        return
    uid = user.get("uid")
    if not uid:
        return
    profile = {
        "uid": uid,
        "email": user.get("email"),
        "name": user.get("name"),
        "displayName": user.get("name"),
        "photoURL": user.get("picture"),
        "lastActiveAt": firestore.SERVER_TIMESTAMP,
    }
    try:
        db = _require_db()
        ref = db.collection("users").document(uid)
        if not ref.get().exists:
            profile["createdAt"] = firestore.SERVER_TIMESTAMP
        ref.set(profile, merge=True)
    except Exception as exc:  # noqa: BLE001 - best-effort, never block request
        logger.warning("Failed to upsert user %s: %s", uid, exc)


def consume_free_request(uid: str, limit: int) -> dict:
    """Atomically consume one free AI request for a user.

    Uses a Firestore transaction to read the current request count, increment it if it's
    under the limit, or return false if the limit is reached. Supports a user-specific
    'customLimit' field override in Firestore.
    """
    db = _require_db()
    ref = db.collection("users").document(uid)
    transaction = db.transaction()

    @firestore.transactional
    def consume(transaction):
        snapshot = ref.get(transaction=transaction)
        data = snapshot.to_dict() or {}
        
        # Override the global limit if a customLimit is set on this specific user
        user_limit = data.get("customLimit", limit)
        if not isinstance(user_limit, int):
            try:
                user_limit = int(user_limit)
            except (ValueError, TypeError):
                user_limit = limit

        used = int(data.get("freeRequestCount", 0))
        if used >= user_limit:
            return {"allowed": False, "used": used, "remaining": 0, "limit": user_limit}

        used += 1
        transaction.set(
            ref,
            {
                "uid": uid,
                "freeRequestCount": used,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )
        return {
            "allowed": True,
            "used": used,
            "remaining": max(user_limit - used, 0),
            "limit": user_limit,
        }

    return consume(transaction)
