"""CivicSathi AI — Flask application entry point.

Uses the application-factory pattern so the app can be created for testing,
local development, and production (Gunicorn/Render) alike.
"""

import logging

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import get_config
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.checklist import checklist_bp
from routes.complaint import complaint_bp
from routes.dashboard import dashboard_bp
from routes.schemes import schemes_bp
from routes.simplify import simplify_bp
from routes.profile import profile_bp
from routes.civicpath import civicpath_bp
from services import prompts
from services.firebase_service import init_firebase
from utils.responses import APIError


def configure_logging(level_name: str) -> None:
    """Configure root logging for the application.
    
    Accepts log level names like 'DEBUG' or 'INFO' (case-insensitive), and
    sets up the basic logging format including timestamps and log levels.
    """
    level = getattr(logging, level_name.upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def register_blueprints(app: Flask) -> None:
    """Register all route blueprints under the /api prefix.
    
    Wires each feature-specific blueprint module (auth, chat, schemes,
    checklist, simplify, complaint, dashboard) to the Flask app instance.
    """
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(schemes_bp, url_prefix="/api/schemes")
    app.register_blueprint(checklist_bp, url_prefix="/api/checklist")
    app.register_blueprint(simplify_bp, url_prefix="/api/simplify")
    app.register_blueprint(complaint_bp, url_prefix="/api/complaint")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(civicpath_bp, url_prefix="/api/civicpath")


def register_error_handlers(app: Flask) -> None:
    """Register global error handlers returning consistent JSON responses.
    
    Catches custom APIError exceptions, standard HTTPExceptions, and fallback unhandled Python
    Exceptions, formatting them into standard JSON envelopes with appropriate status codes.
    """
    logger = logging.getLogger("civicsathi.errors")

    @app.errorhandler(APIError)
    def handle_api_error(exc: APIError):
        # APIError has custom response formatting. Logs 500s as errors, others as info.
        if exc.status >= 500:
            logger.error("APIError %s (%s): %s", exc.status, exc.code, exc.message)
        else:
            logger.info("APIError %s (%s): %s", exc.status, exc.code, exc.message)
        return jsonify(exc.to_dict()), exc.status

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
        # Fallback for standard Werkzeug/Flask HTTP exceptions.
        logger.warning("HTTP %s: %s", exc.code, exc.description)
        return (
            jsonify(
                {
                    "status": "error",
                    "code": exc.name.upper().replace(" ", "_"),
                    "message": exc.description,
                }
            ),
            exc.code,
        )

    @app.errorhandler(Exception)
    def handle_unexpected_exception(exc: Exception):
        # Catches raw, unexpected exceptions and prevents stack traces leaking to clients.
        logger.exception("Unhandled exception: %s", exc)
        return (
            jsonify(
                {
                    "status": "error",
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred.",
                }
            ),
            500,
        )


def create_app() -> Flask:
    """Application factory for the CivilSathi Flask backend.
    
    Initializes configuration, logging, CORS policies, language resolution headers,
    Firebase SDK context, blueprint routes, and error handling.
    """
    config = get_config()

    configure_logging(config.LOG_LEVEL)
    logger = logging.getLogger("civicsathi")

    app = Flask(__name__)
    app.config.from_object(config)

    # Treat "/api/chat" and "/api/chat/" as equivalent so slashless POSTs
    # aren't 308-redirected (which many HTTP clients don't follow).
    app.url_map.strict_slashes = False

    # CORS — scoped to the API surface. Allow the X-Language header through.
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization", "X-Language"],
    )

    @app.before_request
    def _resolve_language():
        # Parse language headers ('en' or 'hi') to decide target output language
        # for LLM text responses, falling back to 'en'. Stores it on Flask request global 'g'.
        from flask import g, request

        lang = (request.headers.get("X-Language") or "en").lower()
        g.language = lang if lang in prompts.SUPPORTED_LANGUAGES else "en"

    # External services initialization
    init_firebase(config)

    if config.AUTH_DISABLED:
        logger.warning(
            "AUTH_DISABLED is true — authentication is bypassed. "
            "Do NOT use this in production."
        )

    # Routes and error handling setup
    register_blueprints(app)
    register_error_handlers(app)

    @app.get("/")
    def index():
        """Root API metadata route."""
        return jsonify({"service": "CivicSathi AI", "status": "ok"})

    @app.get("/health")
    def health():
        """Health check endpoint for container environments."""
        return jsonify({"status": "healthy"})

    logger.info("CivicSathi AI application initialised (env=%s)", config.ENV)
    return app


# Module-level app for Gunicorn/production server: `gunicorn app:app`
app = create_app()


if __name__ == "__main__":
    _config = get_config()
    # Runs the Flask dev server on host and port specified in configuration
    app.run(host=_config.HOST, port=_config.PORT, debug=_config.DEBUG)
