"""Shared response helpers and the application's API exception type.

Every endpoint returns a consistent JSON envelope. Business/validation errors
raise :class:`APIError`, which the global error handler renders into the error
envelope with the correct HTTP status.
"""

from flask import jsonify


class APIError(Exception):
    """An error that maps to a JSON error response.

    Args:
        message: Human-readable message.
        status: HTTP status code.
        code: Stable machine-readable error code.
        details: Optional structured details.
    """

    def __init__(self, message: str, status: int = 400, code: str = "BAD_REQUEST", details=None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code
        self.details = details

    def to_dict(self) -> dict:
        payload = {"status": "error", "message": self.message, "code": self.code}
        if self.details is not None:
            payload["details"] = self.details
        return payload


def success(data=None, message: str = "ok", status: int = 200):
    """Build a standard success response."""
    return jsonify({"status": "success", "message": message, "data": data}), status


def error(message: str, status: int = 400, code: str = "BAD_REQUEST", details=None):
    """Build a standard error response."""
    payload = {"status": "error", "message": message, "code": code}
    if details is not None:
        payload["details"] = details
    return jsonify(payload), status
