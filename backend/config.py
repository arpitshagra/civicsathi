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
    """Parse a boolean environment variable.
    
    Converts string representations like '1', 'true', 'yes', 'on' (case-insensitive)
    to a python boolean. Falls back to default if variable is not set.
    """
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _get_int(name: str, default: int) -> int:
    """Parse an integer environment variable, falling back on the default.
    
    Tries to convert os.getenv(name) to an int, returning default on failure or None.
    """
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _get_float(name: str, default: float) -> float:
    """Parse a float environment variable, falling back on the default.
    
    Tries to convert os.getenv(name) to a float, returning default on failure or None.
    """
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


class Config:
    """Base configuration shared by all environments.
    
    Exposes application settings for Flask, network hosting, CORS, logging,
    authentication bypasses, Groq AI LLM parameters, Firebase service account
    credentials, request size thresholds, and API rate limits.
    """

    # --- Core Flask ---
    # Secret key used for cryptographic signing of sessions/tokens.
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    # Debug mode controls detailed error pages and autoreload features.
    DEBUG = _get_bool("FLASK_DEBUG", False)
    # The running environment ('production', 'development', etc.).
    ENV = os.getenv("FLASK_ENV", "production")

    # --- Networking ---
    # Host IP to bind the server to (0.0.0.0 listens on all interfaces).
    HOST = os.getenv("HOST", "0.0.0.0")
    # Port to bind the server to.
    PORT = _get_int("PORT", 5000)

    # --- CORS ---
    # Comma-separated list of allowed origins, or "*" for all.
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # --- Logging ---
    # System logging output level (e.g. DEBUG, INFO, WARNING, ERROR).
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    # --- Authentication ---
    # When true, protected routes skip Firebase token verification and use a
    # synthetic development user. NEVER enable in production. Defaults to false.
    AUTH_DISABLED = _get_bool("AUTH_DISABLED", False)

    # --- Groq ---
    # API key used to authenticate request headers sent to the Groq LLM service.
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    # LLM model name to run (e.g. llama-3.3-70b-versatile).
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    # Lower temperature for deterministic, structured output.
    GROQ_TEMPERATURE = _get_float("GROQ_TEMPERATURE", 0.3)
    # Slightly higher temperature for the conversational chat assistant.
    GROQ_CHAT_TEMPERATURE = _get_float("GROQ_CHAT_TEMPERATURE", 0.5)
    # Maximum token allowance returned by the model per completion request.
    GROQ_MAX_TOKENS = _get_int("GROQ_MAX_TOKENS", 2048)

    # --- Firebase ---
    # Path to a service account JSON file (file-system path).
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    # Service account JSON credentials provided inline (useful on cloud platforms like Render).
    FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON", "")
    # Google Firebase Project ID.
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")

    # --- Input limits (abuse / cost control) ---
    # Maximum characters allowed for a single chat/assistant message.
    MAX_MESSAGE_LENGTH = _get_int("MAX_MESSAGE_LENGTH", 4000)
    # Maximum characters allowed for a civic notification payload to simplify.
    MAX_NOTIFICATION_LENGTH = _get_int("MAX_NOTIFICATION_LENGTH", 20000)
    # Maximum characters allowed for raw complaint descriptions to format.
    MAX_COMPLAINT_LENGTH = _get_int("MAX_COMPLAINT_LENGTH", 5000)
    # Limit of free requests allowed for unauthenticated or non-premium API requests.
    FREE_REQUEST_LIMIT = _get_int("FREE_REQUEST_LIMIT", 3)

    # --- Dashboard ---
    # Number of items returned in dashboard history view lists.
    DASHBOARD_RECENT_LIMIT = _get_int("DASHBOARD_RECENT_LIMIT", 5)

    @property
    def cors_origins_list(self):
        """Return CORS origins as a list, or "*" for a wildcard.
        
        Splits the CORS_ORIGINS environment variable string by comma delimiters.
        """
        origins = self.CORS_ORIGINS.strip()
        if origins == "*":
            return "*"
        return [o.strip() for o in origins.split(",") if o.strip()]


def get_config() -> Config:
    """Return the active configuration instance.
    
    Instantiates and retrieves the shared configuration container.
    """
    return Config()
