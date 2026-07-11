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
    """Ensure the request body is a JSON object.
    
    Raises 400 APIError if body is not a dictionary.
    """
    if not isinstance(body, dict):
        raise APIError("Request body must be a JSON object.", 400, "INVALID_BODY")
    return body


def require_str(body: dict, field: str, max_length: int, min_length: int = 1) -> str:
    """Validate and return a required string field.
    
    Verifies that the target key exists, is a string, is not empty, and falls within
    the [min_length, max_length] range limit.
    """
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
    """Validate and return an optional string field.
    
    Returns an empty string '' when absent, or validates max length limit when present.
    """
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
    """Validate user chat message payloads."""
    body = require_json(body)
    message = require_str(body, "message", _config.MAX_MESSAGE_LENGTH)
    chat_id = body.get("chatId")
    if chat_id is not None and not isinstance(chat_id, str):
        raise APIError("'chatId' must be a string.", 400, "INVALID_FIELD")
    return {"message": message, "chatId": chat_id}


def validate_schemes(body: Any) -> dict:
    """Validate citizen profile structures for the schemes matchmaker query."""
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
    """Validate checklist service generator query parameters."""
    body = require_json(body)
    return {"service": require_str(body, "service", 120)}


def validate_simplify(body: Any) -> dict:
    """Validate notification summarization text input payloads."""
    body = require_json(body)
    return {"text": require_str(body, "text", _config.MAX_NOTIFICATION_LENGTH, min_length=10)}


def validate_complaint(body: Any) -> dict:
    """Validate complaint description and location strings."""
    body = require_json(body)
    description = require_str(body, "description", _config.MAX_COMPLAINT_LENGTH, min_length=5)
    return {
        "description": description,
        "location": optional_str(body, "location", 200),
    }


_ALLOWED_EDUCATION = {"No School", "10th", "12th", "Diploma", "Graduate", "Postgraduate", "PhD"}
_ALLOWED_OCCUPATION = {
    "Student", "Government Employee", "Private Employee", "Business",
    "Farmer", "Self-employed", "Homemaker", "Senior Citizen", "Unemployed"
}
_ALLOWED_INCOME = {"Less than ₹2.5 Lakh", "₹2.5–5 Lakh", "₹5–10 Lakh", "Above ₹10 Lakh"}
_ALLOWED_CATEGORY = {"General", "OBC", "SC", "ST", "EWS"}
_ALLOWED_DISABILITY = {"Yes", "No"}
_ALLOWED_INTERESTS = {
    "Government Schemes", "Education", "Jobs", "Scholarships", "Healthcare",
    "Agriculture", "Business", "Women Welfare", "Pension", "Housing", "Skill Development"
}

def validate_profile(body: Any) -> dict:
    """Validate citizen profile attributes for onboarding and editing."""
    body = require_json(body)

    # name: required string
    name = require_str(body, "name", 100)

    # email: optional string, read-only
    email = optional_str(body, "email", 100)

    # phone: optional string
    phone = optional_str(body, "phone", 20)

    # dob: optional string
    dob = optional_str(body, "dob", 15)

    # gender: optional string
    gender = optional_str(body, "gender", 40)
    if gender and gender.lower() not in {"male", "female", "other", "prefer not to say"}:
        raise APIError("Invalid gender value.", 400, "INVALID_FIELD")

    # location fields: optional strings
    state = optional_str(body, "state", 80)
    district = optional_str(body, "district", 80)
    city = optional_str(body, "city", 80)
    pincode = optional_str(body, "pincode", 10)

    # education: optional string
    education = optional_str(body, "education", 50)
    if education and education not in _ALLOWED_EDUCATION:
        raise APIError("Invalid education value.", 400, "INVALID_FIELD")

    # occupation: optional string
    occupation = optional_str(body, "occupation", 50)
    if occupation and occupation not in _ALLOWED_OCCUPATION:
        raise APIError("Invalid occupation value.", 400, "INVALID_FIELD")

    # annualIncome: optional string
    annual_income = optional_str(body, "annualIncome", 50)
    if annual_income and annual_income not in _ALLOWED_INCOME:
        raise APIError("Invalid annualIncome value.", 400, "INVALID_FIELD")

    # category: optional string
    category = optional_str(body, "category", 20)
    if category and category not in _ALLOWED_CATEGORY:
        raise APIError("Invalid category value.", 400, "INVALID_FIELD")

    # disability: optional string
    disability = optional_str(body, "disability", 10)
    if disability and disability not in _ALLOWED_DISABILITY:
        raise APIError("Invalid disability value.", 400, "INVALID_FIELD")

    # interests: optional array of strings
    interests = body.get("interests")
    if interests is not None:
        if not isinstance(interests, list):
            raise APIError("'interests' must be an array.", 400, "INVALID_FIELD")
        for interest in interests:
            if not isinstance(interest, str) or interest not in _ALLOWED_INTERESTS:
                raise APIError(f"Invalid interest value: {interest}", 400, "INVALID_FIELD")
    else:
        interests = []

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "dob": dob,
        "gender": gender,
        "state": state,
        "district": district,
        "city": city,
        "pincode": pincode,
        "education": education,
        "occupation": occupation,
        "annualIncome": annual_income,
        "category": category,
        "disability": disability,
        "interests": interests
    }
