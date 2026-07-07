# CivicSathi AI — Backend

Production-ready Flask backend for **CivicSathi AI**, an AI civic assistant that
helps Indian citizens discover government schemes, understand services, prepare
documents, simplify official notifications, and report civic issues.

Built for DEVENGERS PromptWars 2026. See [../docs/SPEC.md](../docs/SPEC.md) for
the full product & architecture specification.

## Stack

- Python 3.12 · Flask · Flask-CORS
- python-dotenv
- Firebase Admin (Auth + Firestore)
- Groq API (Llama 3.3 70B, JSON mode)
- Gunicorn (production server)

## Architecture

Thin controllers → service layer → integrations. AI output is always
schema-normalised before it reaches the client.

```
routes/     HTTP layer (validate input, call services, wrap responses)
services/   business logic + integrations (Groq, Firebase, per-feature)
models/     AI output normalisation (schemas.py)
utils/      auth middleware, request validators, response envelopes
```

Request lifecycle for every AI feature:

```
require_auth (verify Firebase token) → validate request body
→ build prompt → Groq JSON mode (+ 1 repair retry) → normalise output
→ persist if applicable (best-effort) → success envelope
```

## API endpoints

All `/api/*` routes require `Authorization: Bearer <Firebase ID token>`.
Responses use a consistent envelope:

```jsonc
{ "status": "success", "message": "ok", "data": { } }
{ "status": "error", "message": "...", "code": "INVALID_FIELD" }
```

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` · `/health` | Service info / health probe (public) |
| GET | `/api/auth/me` | Verified user profile |
| POST | `/api/chat` | Ask the civic assistant |
| GET | `/api/chat/history` | List conversations |
| GET/DELETE | `/api/chat/{id}` | Get / delete a conversation |
| POST | `/api/schemes` | Find eligible schemes |
| POST | `/api/schemes/save` | Save a scheme |
| GET | `/api/schemes/saved` | List saved schemes |
| DELETE | `/api/schemes/saved/{id}` | Remove saved scheme |
| POST | `/api/checklist` | Generate a document checklist |
| POST | `/api/checklist/save` | Save a checklist |
| GET | `/api/checklist/saved` | List saved checklists |
| DELETE | `/api/checklist/saved/{id}` | Remove saved checklist |
| POST | `/api/simplify` | Simplify a notification |
| POST | `/api/complaint` | Generate a complaint from a description |
| POST | `/api/complaint/save` | File / save a complaint |
| GET | `/api/complaint/history` | List complaint history |
| DELETE | `/api/complaint/{id}` | Delete a complaint |
| GET | `/api/dashboard/summary` | Counts + recent items |

## Local development

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then edit .env

python app.py                    # dev server
# or: gunicorn app:app --bind 0.0.0.0:5000
```

### Testing without live Firebase

Set `AUTH_DISABLED=true` in `.env` to bypass token verification and use a
synthetic dev user. This lets you exercise every endpoint locally without
Firebase credentials. **Never enable it in production** — a startup warning is
logged when it is on.

Without a `GROQ_API_KEY`, AI endpoints return `503 AI_UNAVAILABLE`; without
Firebase, persistence endpoints degrade gracefully (empty lists / `503` on
writes). The app always boots.

## Configuration

All configuration comes from environment variables — see `.env.example`.
No secrets are hardcoded.

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Flask secret key |
| `FLASK_ENV` / `FLASK_DEBUG` | Environment / debug toggle |
| `HOST` / `PORT` | Bind host and port |
| `CORS_ORIGINS` | Comma-separated allowed origins, or `*` |
| `LOG_LEVEL` | `DEBUG` … `CRITICAL` |
| `AUTH_DISABLED` | Bypass auth for local dev (never in prod) |
| `GROQ_API_KEY` / `GROQ_MODEL` | Groq credentials and model id |
| `GROQ_TEMPERATURE` / `GROQ_CHAT_TEMPERATURE` / `GROQ_MAX_TOKENS` | Generation tuning |
| `FIREBASE_CREDENTIALS_PATH` | Path to a service-account JSON, **or...** |
| `FIREBASE_CREDENTIALS_JSON` | ...the service-account JSON inline (Render) |
| `FIREBASE_PROJECT_ID` | Firebase project id |
| `MAX_MESSAGE_LENGTH` / `MAX_NOTIFICATION_LENGTH` / `MAX_COMPLAINT_LENGTH` | Input size caps |
| `DASHBOARD_RECENT_LIMIT` | Recent items per dashboard section |

## Deploying to Render

`render.yaml` and `Procfile` are included. Create a Blueprint (or a Web Service
with `rootDir=backend`), then set the `sync: false` secrets in the dashboard:
`GROQ_API_KEY`, `FIREBASE_CREDENTIALS_JSON`, `FIREBASE_PROJECT_ID`,
`CORS_ORIGINS`. Health check: `/health`.

```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

## Security notes

- Firebase ID token verified on every protected route; all Firestore queries
  scoped to the caller's `uid`, with ownership checks on read/delete.
- Server-side request validation with input size caps.
- User-supplied text (questions, notifications, complaints) is passed to the
  model strictly as **data**, mitigating prompt injection.
- AI output is schema-normalised before returning (confidence clamped to 0–1,
  list fields coerced, unknown keys dropped).
- Secrets via environment variables only; `.env` is gitignored.
