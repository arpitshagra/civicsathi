"""Text utilities.

The AI features must never return markdown to the client. Prompts already
instruct the model to avoid it, but we defensively strip markdown formatting
from every output string as a second line of defence. The stripping is
conservative: it removes emphasis/heading/list/link/code markup while leaving
plain text, URLs, and stray underscores/asterisks (e.g. in identifiers) intact.
"""

import re

_CODE_FENCE = re.compile(r"```[a-zA-Z0-9]*\n?")
_INLINE_LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")
_BARE_LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
_HEADING = re.compile(r"^\s{0,3}#{1,6}\s+", re.MULTILINE)
_LIST_MARKER = re.compile(r"^\s{0,3}([-*+]|\d+\.)\s+", re.MULTILINE)
_BLOCKQUOTE = re.compile(r"^\s{0,3}>\s?", re.MULTILINE)

# Paired emphasis only — avoids clobbering standalone * or _ in identifiers.
_BOLD_STAR = re.compile(r"\*\*(.+?)\*\*", re.DOTALL)
_BOLD_UNDER = re.compile(r"__(.+?)__", re.DOTALL)
_ITALIC_STAR = re.compile(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", re.DOTALL)
_ITALIC_UNDER = re.compile(r"(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])", re.DOTALL)


def strip_markdown(text):
    """Return ``text`` with common markdown formatting removed.

    Non-string input is returned unchanged.
    """
    if not isinstance(text, str) or not text:
        return text

    text = _CODE_FENCE.sub("", text)
    text = _INLINE_LINK.sub(r"\1 (\2)", text)  # keep link + destination
    text = _BARE_LINK.sub(r"\1 (\2)", text)
    text = _HEADING.sub("", text)
    text = _BLOCKQUOTE.sub("", text)
    text = _LIST_MARKER.sub("", text)
    text = _BOLD_STAR.sub(r"\1", text)
    text = _BOLD_UNDER.sub(r"\1", text)
    text = _ITALIC_STAR.sub(r"\1", text)
    text = _ITALIC_UNDER.sub(r"\1", text)
    text = text.replace("`", "")

    return text.strip()
