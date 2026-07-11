"""Shared AI-call helper.

Wraps :func:`groq_service.generate_json`, converting the low-level Groq errors
into API-level :class:`APIError`s with appropriate HTTP status codes so routes
and the global error handler stay consistent.
"""

from typing import Optional

from services import groq_service, prompts
from utils.responses import APIError


def _current_language() -> str:
    """Read the per-request output language resolved in app.before_request.
    
    Checks if a Flask request context is present and returns the language code (e.g. 'en', 'hi')
    stored in request-global storage 'g', falling back to 'en' on failure.
    """
    try:
        from flask import g, has_request_context

        if has_request_context():
            return getattr(g, "language", "en")
    except Exception:  # noqa: BLE001 - never let language lookup break a call
        pass
    return "en"


def ai_generate(
    system_prompt: str,
    user_prompt: str,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
) -> dict:
    """Generate structured JSON responses using the Groq LLM API.
    
    1. Appends a language instruction directive based on the client request header.
    2. Dynamically fetches and injects the user's profile context if authenticated.
    3. Sends the system and user prompts to the groq_service.
    4. Handles and logs service unavailability and response formatting errors.
    """
    system_prompt = system_prompt + prompts.language_directive(_current_language())

    # Dynamically inject User Profile Context for AI personalization
    try:
        from flask import g, has_request_context
        if has_request_context() and hasattr(g, "user") and g.user:
            uid = g.user.get("uid")
            if uid:
                from services import firebase_service
                profile = firebase_service.get_document("users", uid)
                if profile:
                    profile_context = "\n\nUser Profile Context for personalization:\n"
                    if profile.get("state"):
                        profile_context += f"- State of Residence: {profile.get('state')}\n"
                    if profile.get("occupation"):
                        profile_context += f"- Primary Occupation: {profile.get('occupation')}\n"
                    if profile.get("annualIncome"):
                        profile_context += f"- Annual Family Income: {profile.get('annualIncome')}\n"
                    if profile.get("education"):
                        profile_context += f"- Highest Education: {profile.get('education')}\n"
                    if profile.get("gender"):
                        profile_context += f"- Gender: {profile.get('gender')}\n"
                    if profile.get("dob"):
                        profile_context += f"- Date of Birth: {profile.get('dob')}\n"
                        try:
                            from datetime import datetime
                            dob = datetime.strptime(profile.get("dob"), "%Y-%m-%d")
                            age = datetime.now().year - dob.year
                            profile_context += f"- Age: {age}\n"
                        except Exception:
                            pass
                    if profile.get("category"):
                        profile_context += f"- Category: {profile.get('category')}\n"
                    if profile.get("disability"):
                        profile_context += f"- Disability: {profile.get('disability')}\n"
                    if profile.get("interests"):
                        profile_context += f"- Interests: {', '.join(profile.get('interests'))}\n"
                    system_prompt = system_prompt + profile_context
    except Exception as exc:
        import logging
        logger = logging.getLogger("civicsathi.ai_helpers")
        logger.warning("Failed to inject profile context: %s", exc)

    try:
        return groq_service.generate_json(
            system_prompt,
            user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    except groq_service.GroqUnavailableError as exc:
        # Convert internal service unavailability to user-friendly APIError
        raise APIError("AI service is not configured.", 503, "AI_UNAVAILABLE") from exc

    except groq_service.GroqResponseError as exc:
        # Convert invalid response format errors from the LLM to user-friendly APIError
        raise APIError("AI service returned an invalid response.", 502, "AI_ERROR") from exc

    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise APIError(str(exc), 502, "AI_ERROR") from exc
