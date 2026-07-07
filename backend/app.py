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
from services import prompts
from services.firebase_service import init_firebase
from utils.responses import APIError


def configure_logging(level_name: str) -> None:
    """Configure root logging for the application."""
    level = getattr(logging, level_name.upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )


def register_blueprints(app: Flask) -> None:
    """Register all route blueprints under the /api prefix."""
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(chat_bp, url_prefix="/api/chat")
    app.register_blueprint(schemes_bp, url_prefix="/api/schemes")
    app.register_blueprint(checklist_bp, url_prefix="/api/checklist")
    app.register_blueprint(simplify_bp, url_prefix="/api/simplify")
    app.register_blueprint(complaint_bp, url_prefix="/api/complaint")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")


def register_error_handlers(app: Flask) -> None:
    """Register global error handlers returning consistent JSON responses."""
    logger = logging.getLogger("civicsathi.errors")

    @app.errorhandler(APIError)
    def handle_api_error(exc: APIError):
        if exc.status >= 500:
            logger.error("APIError %s (%s): %s", exc.status, exc.code, exc.message)
        else:
            logger.info("APIError %s (%s): %s", exc.status, exc.code, exc.message)
        return jsonify(exc.to_dict()), exc.status

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
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
    """Application factory."""
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
        # Preferred output language for AI responses (en | hi). Defaults to en.
        from flask import g, request

        lang = (request.headers.get("X-Language") or "en").lower()
        g.language = lang if lang in prompts.SUPPORTED_LANGUAGES else "en"

    # External services
    init_firebase(config)

    if config.AUTH_DISABLED:
        logger.warning(
            "AUTH_DISABLED is true — authentication is bypassed. "
            "Do NOT use this in production."
        )

    # Routes and error handling
    register_blueprints(app)
    register_error_handlers(app)

    @app.get("/")
    def index():
        return jsonify({"service": "CivicSathi AI", "status": "ok"})

    @app.get("/health")
    def health():
        return jsonify({"status": "healthy"})

    logger.info("CivicSathi AI application initialised (env=%s)", config.ENV)
    return app


# Module-level app for Gunicorn: `gunicorn app:app`
app = create_app()


if __name__ == "__main__":
    _config = get_config()
    app.run(host=_config.HOST, port=_config.PORT, debug=_config.DEBUG)
