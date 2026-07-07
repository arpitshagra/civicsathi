"""Groq API client wrapper.

Provides a lazily-initialised wrapper around the Groq SDK plus a JSON-mode
helper with a single repair retry. Feature services call :func:`generate_json`
with their own system/user prompts and receive a parsed dict; schema validation
happens in ``models/schemas.py``.
"""

import json
import logging
from typing import List, Optional

from groq import Groq

from config import get_config

logger = logging.getLogger("civicsathi.groq")

_client: Optional[Groq] = None


class GroqUnavailableError(RuntimeError):
    """Raised when the Groq client is not configured."""


class GroqResponseError(RuntimeError):
    """Raised when Groq returns output that cannot be parsed as JSON."""


def get_client() -> Optional[Groq]:
    """Return a lazily-initialised Groq client, or None if unconfigured."""
    global _client

    if _client is not None:
        return _client

    config = get_config()
    if not config.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not configured; Groq features disabled.")
        return None

    _client = Groq(api_key=config.GROQ_API_KEY)
    logger.info("Groq client initialised.")
    return _client


def chat_completion(
    messages: List[dict],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    response_format: Optional[dict] = None,
) -> str:
    """Send a chat-completion request to Groq and return the response text.

    Raises:
        GroqUnavailableError: If the Groq client is not configured.
    """
    client = get_client()
    if client is None:
        raise GroqUnavailableError("Groq client is not configured.")

    config = get_config()
    kwargs = {
        "model": model or config.GROQ_MODEL,
        "messages": messages,
        "temperature": (
            temperature if temperature is not None else config.GROQ_TEMPERATURE
        ),
        "max_tokens": max_tokens or config.GROQ_MAX_TOKENS,
    }
    if response_format is not None:
        kwargs["response_format"] = response_format

    completion = client.chat.completions.create(**kwargs)
    return completion.choices[0].message.content or ""


def _extract_json(text: str) -> dict:
    """Parse a JSON object from model output, tolerating code fences/prose."""
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fall back to the first balanced {...} block.
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = text[start : end + 1]
        return json.loads(candidate)  # may raise; caller handles

    raise json.JSONDecodeError("No JSON object found", text, 0)


def generate_json(
    system_prompt: str,
    user_prompt: str,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
) -> dict:
    """Request a JSON object from Groq, with one repair retry on failure.

    Raises:
        GroqUnavailableError: If the Groq client is not configured.
        GroqResponseError: If valid JSON cannot be obtained after a retry.
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    raw = chat_completion(
        messages,
        temperature=temperature,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )

    try:
        return _extract_json(raw)
    except json.JSONDecodeError as exc:
        logger.warning("Groq returned non-JSON output; attempting repair. %s", exc)

    # Repair attempt: feed the bad output back and ask for valid JSON only.
    repair_messages = messages + [
        {"role": "assistant", "content": raw},
        {
            "role": "user",
            "content": (
                "Your previous response was not valid JSON. Respond again with "
                "ONLY a single valid JSON object and no other text."
            ),
        },
    ]
    repaired = chat_completion(
        repair_messages,
        temperature=0.0,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )
    try:
        return _extract_json(repaired)
    except json.JSONDecodeError as exc:
        logger.error("Groq repair attempt failed to produce JSON: %s", exc)
        raise GroqResponseError("Model did not return valid JSON.") from exc
