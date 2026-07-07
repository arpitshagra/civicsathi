"""Application configuration.

All configuration is sourced from environment variables. Never hardcode
secrets here. Load a local ``.env`` file during development via python-dotenv;
in production (e.g. Render) the environment is provided by the platform.
"""

import os

from dotenv import load_dotenv

# Load variables from a local .env file when present. In production the
# platform's environment takes precedence and this is effectively a no-op.
load_dotenv()


def _get_bool(name: str, default: bool = False) -> bool:
    """Parse a boolean environment variable."""
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_int(name: str, default: int) -> int:
    """Parse an integer environment variable, falling back on the default."""
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _get_float(name: str, default: float) -> float:
    """Parse a float environment variable, falling back on the default."""
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


class Config:
    """Base configuration shared by all environments."""

    # --- Core Flask ---
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    DEBUG = _get_bool("FLASK_DEBUG", False)
    ENV = os.getenv("FLASK_ENV", "production")

    # --- Networking ---
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = _get_int("PORT", 5000)

    # --- CORS ---
    # Comma-separated list of allowed origins, or "*" for all.
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # --- Logging ---
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    # --- Authentication ---
    # When true, protected routes skip Firebase token verification and use a
    # synthetic development user. NEVER enable in production. Defaults to false.
    AUTH_DISABLED = _get_bool("AUTH_DISABLED", False)

    # --- Groq ---
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    # Lower temperature for deterministic, structured output.
    GROQ_TEMPERATURE = _get_float("GROQ_TEMPERATURE", 0.3)
    # Slightly higher for the conversational assistant.
    GROQ_CHAT_TEMPERATURE = _get_float("GROQ_CHAT_TEMPERATURE", 0.5)
    GROQ_MAX_TOKENS = _get_int("GROQ_MAX_TOKENS", 2048)

    # --- Firebase ---
    # Path to a service account JSON file...
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    # ...or the service account JSON provided inline (useful on Render where
    # a file may not be present). One of the two should be set.
    FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON", "")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")

    # --- Input limits (abuse / cost control) ---
    MAX_MESSAGE_LENGTH = _get_int("MAX_MESSAGE_LENGTH", 4000)
    MAX_NOTIFICATION_LENGTH = _get_int("MAX_NOTIFICATION_LENGTH", 20000)
    MAX_COMPLAINT_LENGTH = _get_int("MAX_COMPLAINT_LENGTH", 5000)
    FREE_REQUEST_LIMIT = _get_int("FREE_REQUEST_LIMIT", 3)

    # --- Dashboard ---
    DASHBOARD_RECENT_LIMIT = _get_int("DASHBOARD_RECENT_LIMIT", 5)

    @property
    def cors_origins_list(self):
        """Return CORS origins as a list, or "*" for a wildcard."""
        origins = self.CORS_ORIGINS.strip()
        if origins == "*":
            return "*"
        return [o.strip() for o in origins.split(",") if o.strip()]


def get_config() -> Config:
    """Return the active configuration instance."""
    return Config()
