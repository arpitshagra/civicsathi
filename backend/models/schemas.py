"""Normalisation of AI (Groq) output into strict, client-safe shapes.

The model is instructed to return JSON matching a per-feature contract, but we
never trust it blindly. Each ``normalize_*`` function coerces the raw dict into
the canonical schema: missing fields get safe defaults, list fields are forced
to lists of strings, and confidence is clamped to ``[0, 1]``. This guarantees a
consistent API response regardless of model drift.
"""

from typing import Any, List

from utils.text import strip_markdown

_ALLOWED_PRIORITIES = {"Low", "Medium", "High"}


# ---------------------------------------------------------------------------
# Coercion helpers
# ---------------------------------------------------------------------------

def _as_str(value: Any, default: str = "") -> str:
    if value is None:
        return default
    if isinstance(value, str):
        return strip_markdown(value.strip())
    return str(value)


def _as_optional_str(value: Any):
    if value is None:
        return None
    text = _as_str(value)
    return text or None


def _as_str_list(value: Any) -> List[str]:
    """Coerce a value into a list of non-empty strings."""
    if value is None:
        return []
    if isinstance(value, str):
        text = strip_markdown(value.strip())
        return [text] if text else []
    if isinstance(value, (list, tuple)):
        items = []
        for item in value:
            if isinstance(item, str):
                text = strip_markdown(item.strip())
            elif isinstance(item, dict):
                # Occasionally the model wraps strings in objects.
                text = _as_str(
                    item.get("text") or item.get("value") or item.get("name")
                )
            else:
                text = _as_str(item)
            if text:
                items.append(text)
        return items
    return []


def _clamp_confidence(value: Any, default: float = 0.5) -> float:
    """Clamp a confidence value into the range [0, 1]."""
    try:
        num = float(value)
    except (TypeError, ValueError):
        return default
    if num < 0:
        return 0.0
    if num <= 1:
        return round(num, 3)
    # Values just above 1 are almost certainly an overshoot of the 0..1 scale.
    if num <= 2:
        return 1.0
    # Larger values (e.g. 85) are treated as a 0-100 percentage scale.
    return round(min(num / 100.0, 1.0), 3)


def _ensure_dict(data: Any) -> dict:
    return data if isinstance(data, dict) else {}


# ---------------------------------------------------------------------------
# Feature 1 — Assistant
# ---------------------------------------------------------------------------

def normalize_assistant(data: Any) -> dict:
    data = _ensure_dict(data)
    portals = []
    for p in data.get("officialPortals") or []:
        if isinstance(p, dict):
            name = _as_str(p.get("name"))
            url = _as_str(p.get("url"))
            if name or url:
                portals.append({"name": name, "url": url})
        elif isinstance(p, str) and p.strip():
            portals.append({"name": p.strip(), "url": p.strip()})
    return {
        "answer": _as_str(data.get("answer")),
        "steps": _as_str_list(data.get("steps")),
        "requiredDocuments": _as_str_list(data.get("requiredDocuments")),
        "processingTime": _as_optional_str(data.get("processingTime")),
        "officialPortals": portals,
        "confidence": _clamp_confidence(data.get("confidence")),
        "uncertaintyNote": _as_optional_str(data.get("uncertaintyNote")),
    }


# ---------------------------------------------------------------------------
# Feature 2 — Schemes
# ---------------------------------------------------------------------------

def _normalize_scheme(item: Any) -> dict:
    item = _ensure_dict(item)
    return {
        "name": _as_str(item.get("name")),
        "whyEligible": _as_str(item.get("whyEligible")),
        "benefits": _as_str_list(item.get("benefits")),
        "requiredDocuments": _as_str_list(item.get("requiredDocuments")),
        "applicationProcess": _as_str_list(item.get("applicationProcess")),
        "officialWebsite": _as_optional_str(item.get("officialWebsite")),
        "confidence": _clamp_confidence(item.get("confidence")),
    }


def normalize_schemes(data: Any) -> dict:
    data = _ensure_dict(data)
    raw = data.get("schemes")
    if not isinstance(raw, list):
        raw = []
    schemes = [_normalize_scheme(s) for s in raw]
    schemes = [s for s in schemes if s["name"]]
    return {
        "schemes": schemes,
        "disclaimer": _as_str(
            data.get("disclaimer"),
            "Eligibility is indicative only; verify on the official portals.",
        ),
    }


# ---------------------------------------------------------------------------
# Feature 3 — Checklist
# ---------------------------------------------------------------------------

def normalize_checklist(data: Any, service: str = "") -> dict:
    data = _ensure_dict(data)
    return {
        "service": _as_str(data.get("service")) or service,
        "requiredDocuments": _as_str_list(data.get("requiredDocuments")),
        "optionalDocuments": _as_str_list(data.get("optionalDocuments")),
        "processingTime": _as_optional_str(data.get("processingTime")),
        "commonRejectionReasons": _as_str_list(data.get("commonRejectionReasons")),
        "tips": _as_str_list(data.get("tips")),
        "officialWebsite": _as_optional_str(data.get("officialWebsite")),
        "confidence": _clamp_confidence(data.get("confidence")),
    }


# ---------------------------------------------------------------------------
# Feature 4 — Simplify
# ---------------------------------------------------------------------------

def normalize_simplify(data: Any) -> dict:
    data = _ensure_dict(data)
    dates = []
    for d in data.get("importantDates") or []:
        if isinstance(d, dict):
            label = _as_str(d.get("label"))
            date = _as_str(d.get("date"))
            if label or date:
                dates.append({"label": label, "date": date})
        elif isinstance(d, str) and d.strip():
            dates.append({"label": "", "date": d.strip()})
    return {
        "summary": _as_str(data.get("summary")),
        "keyPoints": _as_str_list(data.get("keyPoints")),
        "importantDates": dates,
        "citizenActions": _as_str_list(data.get("citizenActions")),
        "confidence": _clamp_confidence(data.get("confidence")),
    }


# ---------------------------------------------------------------------------
# Feature 5 — Complaint
# ---------------------------------------------------------------------------

def normalize_complaint(data: Any) -> dict:
    data = _ensure_dict(data)
    priority = _as_str(data.get("priority")).title()
    if priority not in _ALLOWED_PRIORITIES:
        priority = "Medium"
    return {
        "category": _as_str(data.get("category")) or "Other",
        "department": _as_str(data.get("department")),
        "priority": priority,
        "title": _as_str(data.get("title")),
        "description": _as_str(data.get("description")),
        "confidence": _clamp_confidence(data.get("confidence")),
    }
