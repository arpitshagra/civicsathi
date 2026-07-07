"""Shared AI-call helper.

Wraps :func:`groq_service.generate_json`, converting the low-level Groq errors
into API-level :class:`APIError`s with appropriate HTTP status codes so routes
and the global error handler stay consistent.
"""

from typing import Optional

from services import groq_service, prompts
from utils.responses import APIError


def _current_language() -> str:
    """Read the per-request output language resolved in app.before_request."""
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
    """Generate a JSON object from Groq, mapping failures to APIError.

    Appends a language directive so all human-readable output honours the
    request's ``X-Language`` header (English by default, Hindi when ``hi``).
    """
    system_prompt = system_prompt + prompts.language_directive(_current_language())
    try:
        return groq_service.generate_json(
            system_prompt,
            user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    except groq_service.GroqUnavailableError as exc:
        raise APIError("AI service is not configured.", 503, "AI_UNAVAILABLE") from exc
    except groq_service.GroqResponseError as exc:
        raise APIError("AI service returned an invalid response.", 502, "AI_ERROR") from exc
    except Exception as exc:  # noqa: BLE001 - upstream/network failures
      import traceback
    traceback.print_exc()
    raise APIError(502, "AI_ERROR", str(exc))
