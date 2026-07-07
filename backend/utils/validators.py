"""Request-body validation helpers.

Small, dependency-free validators that raise :class:`APIError` (400) on invalid
input so the global error handler renders a consistent error envelope. Every
feature route validates its request body here before touching the AI layer.
"""

from typing import Any

from config import get_config
from utils.responses import APIError

_config = get_config()

# Reasonable bounds for the scheme eligibility profile.
_MIN_AGE, _MAX_AGE = 0, 120
_MIN_INCOME, _MAX_INCOME = 0, 1_000_000_000
_ALLOWED_GENDERS = {"male", "female", "other", "prefer not to say"}


def require_json(body: Any) -> dict:
    """Ensure the request body is a JSON object."""
    if not isinstance(body, dict):
        raise APIError("Request body must be a JSON object.", 400, "INVALID_BODY")
    return body


def require_str(body: dict, field: str, max_length: int, min_length: int = 1) -> str:
    """Validate and return a required, length-bounded string field."""
    value = body.get(field)
    if not isinstance(value, str) or not value.strip():
        raise APIError(f"'{field}' is required and must be a non-empty string.", 400, "INVALID_FIELD")
    value = value.strip()
    if len(value) < min_length:
        raise APIError(f"'{field}' is too short.", 400, "INVALID_FIELD")
    if len(value) > max_length:
        raise APIError(
            f"'{field}' exceeds the maximum length of {max_length} characters.",
            400,
            "FIELD_TOO_LONG",
        )
    return value


def optional_str(body: dict, field: str, max_length: int) -> str:
    """Validate and return an optional string field ('' when absent)."""
    value = body.get(field)
    if value is None:
        return ""
    if not isinstance(value, str):
        raise APIError(f"'{field}' must be a string.", 400, "INVALID_FIELD")
    value = value.strip()
    if len(value) > max_length:
        raise APIError(
            f"'{field}' exceeds the maximum length of {max_length} characters.",
            400,
            "FIELD_TOO_LONG",
        )
    return value


# ---------------------------------------------------------------------------
# Feature-specific validators
# ---------------------------------------------------------------------------

def validate_chat(body: Any) -> dict:
    body = require_json(body)
    message = require_str(body, "message", _config.MAX_MESSAGE_LENGTH)
    chat_id = body.get("chatId")
    if chat_id is not None and not isinstance(chat_id, str):
        raise APIError("'chatId' must be a string.", 400, "INVALID_FIELD")
    return {"message": message, "chatId": chat_id}


def validate_schemes(body: Any) -> dict:
    body = require_json(body)

    # Age
    try:
        age = int(body.get("age"))
    except (TypeError, ValueError):
        raise APIError("'age' is required and must be an integer.", 400, "INVALID_FIELD")
    if not _MIN_AGE <= age <= _MAX_AGE:
        raise APIError(f"'age' must be between {_MIN_AGE} and {_MAX_AGE}.", 400, "INVALID_FIELD")

    # Income
    try:
        income = int(body.get("annualIncome"))
    except (TypeError, ValueError):
        raise APIError("'annualIncome' is required and must be an integer.", 400, "INVALID_FIELD")
    if not _MIN_INCOME <= income <= _MAX_INCOME:
        raise APIError("'annualIncome' is out of range.", 400, "INVALID_FIELD")

    # Gender
    gender = require_str(body, "gender", 40)
    if gender.lower() not in _ALLOWED_GENDERS:
        raise APIError(
            "'gender' must be one of: Male, Female, Other, Prefer not to say.",
            400,
            "INVALID_FIELD",
        )

    return {
        "age": age,
        "state": require_str(body, "state", 80),
        "occupation": require_str(body, "occupation", 80),
        "education": require_str(body, "education", 80),
        "annualIncome": income,
        "gender": gender,
    }


def validate_checklist(body: Any) -> dict:
    body = require_json(body)
    return {"service": require_str(body, "service", 120)}


def validate_simplify(body: Any) -> dict:
    body = require_json(body)
    return {"text": require_str(body, "text", _config.MAX_NOTIFICATION_LENGTH, min_length=10)}


def validate_complaint(body: Any) -> dict:
    body = require_json(body)
    description = require_str(body, "description", _config.MAX_COMPLAINT_LENGTH, min_length=5)
    return {
        "description": description,
        "location": optional_str(body, "location", 200),
    }
