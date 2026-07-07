"""Feature 4 — Government Notification Simplifier business logic."""

import logging

from models import schemas
from services import history_service, prompts
from services.ai_helpers import ai_generate

logger = logging.getLogger("civicsathi.simplify_service")


def simplify_notification(uid: str, text: str) -> dict:
    """Simplify a government notification into plain-language guidance.

    The original notification text can be long/sensitive, so only a short
    excerpt is stored in the history log alongside the structured result.
    """
    raw = ai_generate(
        prompts.SIMPLIFY_SYSTEM_PROMPT,
        prompts.build_simplify_prompt(text),
    )
    result = schemas.normalize_simplify(raw)

    excerpt = text[:280] + ("…" if len(text) > 280 else "")
    history_id = history_service.record(uid, "simplify", {"excerpt": excerpt}, result)
    return {**result, "historyId": history_id}
