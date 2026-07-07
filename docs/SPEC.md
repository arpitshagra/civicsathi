# CivicSathi AI — Product & Architecture Specification

> DEVENGERS PromptWars 2026 · v1.0 · Design blueprint (no implementation code)

---

## 1. Product Specification

### 1.1 Vision
CivicSathi AI is an AI-powered civic assistance SaaS platform that removes the
information gap between Indian citizens and government services. It behaves like
a knowledgeable civic guide: discovering schemes, explaining procedures,
preparing document checklists, decoding official notifications, and filing civic
complaints — all in plain language, in one place.

### 1.2 Problem
- Government information is scattered across hundreds of portals.
- Eligibility rules are complex and vary by state.
- Notifications are written in dense bureaucratic/legal language.
- Citizens don't know which department owns a civic issue.
- No unified place to track what you've asked, saved, or reported.

### 1.3 Target Users
| Persona | Need |
|---|---|
| Rural / first-time applicant | Simple, step-by-step guidance |
| Student / job seeker | Scholarships, skill schemes, PAN, passport |
| Working professional | Fast document checklists, notification decoding |
| Senior citizen | Pension schemes, simplified language |
| Active resident | Report potholes/garbage/streetlights easily |

### 1.4 Value Proposition
- One assistant for discovery → understanding → action → tracking.
- Plain-language output with **explicit uncertainty** (never fake confidence).
- Always points to **official portals** so users can verify and act.
- Feels like a product (auth, dashboard, saved items, history), not a chatbot.

### 1.5 Feature Summary
| # | Feature | Input | Core Output |
|---|---|---|---|
| 1 | AI Civic Assistant | Free-text question | Steps, docs, time, portal, confidence |
| 2 | Scheme Eligibility Finder | Profile (age, state, etc.) | Ranked eligible schemes w/ confidence |
| 3 | Document Checklist Generator | Service name | Required/optional docs, time, tips |
| 4 | Notification Simplifier | Pasted text | Summary, key points, dates, actions |
| 5 | Complaint Generator | Image/description | Category, dept, priority, title, body |
| 6 | User Dashboard | Auth session | Chats, saved schemes/checklists, complaints |

### 1.6 Non-Functional Requirements
- **Fast** — Groq low-latency inference; stateless API; thin controllers.
- **Responsive** — JSON-only REST consumed by a React SPA.
- **Secure** — Firebase ID-token verification on every protected route.
- **Modular** — Blueprints + service layer; AI prompts isolated.
- **Scalable** — Stateless backend (horizontal scaling on Render/Gunicorn).
- **Reliable** — Global error handler; graceful degradation if AI/DB down.
- **Consistent** — Every AI feature returns a strict, validated JSON schema.

### 1.7 Out of Scope (Hackathon v1)
- Real government API integrations / live application submission.
- Payments, Aadhaar/DigiLocker integration, OCR of uploaded documents.
- Multi-language UI (English-first; content simplification only).
- Admin/government-side console.

---

## 2. User Flows

### 2.1 Authentication
```
Landing → Sign in with Google (Firebase Auth) → ID token issued (client)
→ Token sent as `Authorization: Bearer <token>` on API calls
→ Backend verifies token → user context established
```

### 2.2 AI Civic Assistant
```
User types question
→ POST /api/chat
→ Backend builds prompt (system + user) → Groq
→ Structured JSON answer (steps, docs, time, portal, confidence)
→ Rendered as assistant message
→ Conversation persisted to Firestore (chats/{chatId})
```

### 2.3 Scheme Eligibility Finder
```
User fills profile form (age, state, occupation, education, income, gender)
→ POST /api/schemes
→ Groq reasons over profile → ranked schemes with confidence scores
→ User can Save a scheme → POST /api/schemes/save → savedSchemes/{id}
```

### 2.4 Document Checklist Generator
```
User selects service (Passport / DL / PAN / Birth Certificate / custom)
→ POST /api/checklist
→ Groq returns docs + tips + rejection reasons
→ User can Save → savedChecklists/{id}
```

### 2.5 Notification Simplifier
```
User pastes long notification text
→ POST /api/simplify
→ Groq returns summary + key points + dates + citizen actions
```

### 2.6 Complaint Generator
```
User uploads image OR describes issue
→ (optional) image stored / passed as description
→ POST /api/complaint
→ Groq classifies → category, department, priority, title, description
→ User confirms → POST /api/complaint/save → complaints/{id}
```

### 2.7 Dashboard
```
User opens dashboard
→ GET /api/dashboard/summary (counts + recents)
→ GET /api/chat/history, /api/schemes/saved, /api/checklist/saved, /api/complaint/history
→ User can open/delete any saved item
```

---

## 3. Folder Architecture

### 3.1 Backend (Flask)
```
backend/
├── app.py                     # App factory, blueprints, error handlers, health
├── config.py                  # Env-driven configuration
├── requirements.txt
├── .env.example
├── Procfile / render.yaml     # Deployment
├── routes/                    # REST Blueprints (thin controllers)
│   ├── auth.py                # Token verification / whoami
│   ├── chat.py                # Feature 1
│   ├── schemes.py             # Feature 2 (+ save/list/delete)
│   ├── checklist.py           # Feature 3 (+ save/list/delete)
│   ├── simplify.py            # Feature 4
│   ├── complaint.py           # Feature 5 (+ save/list/delete)
│   └── dashboard.py           # Feature 6 (aggregation)
├── services/                  # Business + integration layer
│   ├── groq_service.py        # Groq client + JSON-mode completions
│   ├── firebase_service.py    # Firebase init, Firestore accessors
│   ├── prompts.py             # System prompts + builders per feature
│   ├── chat_service.py        # Feature logic (assistant)
│   ├── schemes_service.py
│   ├── checklist_service.py
│   ├── simplify_service.py
│   └── complaint_service.py
├── models/                    # Firestore document shapes / serializers
│   └── schemas.py             # Pydantic-style validation of AI JSON
├── utils/
│   ├── auth_middleware.py     # @require_auth decorator (token verify)
│   ├── responses.py           # Standard success/error envelopes
│   ├── validators.py          # Request body validation
│   └── rate_limit.py          # Per-user throttling (optional)
└── tests/
```

### 3.2 Frontend (React / Google Stitch)
```
frontend/
├── src/
│   ├── main.jsx / App.jsx
│   ├── firebase.js            # Firebase client init
│   ├── api/                   # Axios client + per-feature API modules
│   ├── context/AuthContext    # Auth state, token injection
│   ├── components/            # Shared UI (Navbar, Card, Loader, ConfidenceBadge)
│   ├── pages/
│   │   ├── Landing / Login
│   │   ├── Assistant          # Feature 1
│   │   ├── SchemeFinder       # Feature 2
│   │   ├── Checklist          # Feature 3
│   │   ├── Simplifier         # Feature 4
│   │   ├── Complaint          # Feature 5
│   │   └── Dashboard          # Feature 6
│   └── styles/
└── package.json
```

---

## 4. API List (REST · JSON only)

All protected endpoints require `Authorization: Bearer <Firebase ID token>`.
Base path: `/api`.

### 4.1 System
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | No | Service info |
| GET | `/health` | No | Health probe |

### 4.2 Auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/auth/me` | Yes | Return verified user profile |

### 4.3 Feature 1 — Assistant
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/chat` | Yes | Ask the civic assistant |
| GET | `/api/chat/history` | Yes | List user conversations |
| GET | `/api/chat/{chatId}` | Yes | Get one conversation |
| DELETE | `/api/chat/{chatId}` | Yes | Delete a conversation |

### 4.4 Feature 2 — Schemes
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/schemes` | Yes | Find eligible schemes |
| POST | `/api/schemes/save` | Yes | Save a scheme |
| GET | `/api/schemes/saved` | Yes | List saved schemes |
| DELETE | `/api/schemes/saved/{id}` | Yes | Remove saved scheme |

### 4.5 Feature 3 — Checklist
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/checklist` | Yes | Generate a checklist |
| POST | `/api/checklist/save` | Yes | Save a checklist |
| GET | `/api/checklist/saved` | Yes | List saved checklists |
| DELETE | `/api/checklist/saved/{id}` | Yes | Remove saved checklist |

### 4.6 Feature 4 — Simplify
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/simplify` | Yes | Simplify a notification |

### 4.7 Feature 5 — Complaint
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/complaint` | Yes | Generate complaint from issue/image |
| POST | `/api/complaint/save` | Yes | Save/file a complaint |
| GET | `/api/complaint/history` | Yes | List user complaints |
| DELETE | `/api/complaint/{id}` | Yes | Delete a complaint |

### 4.8 Feature 6 — Dashboard
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Yes | Counts + recent items |

---

## 5. Database Collections (Firestore)

Root collections keyed by `userId` (Firebase UID) for ownership + security rules.

```
users/{uid}
  ├─ displayName, email, photoURL, createdAt, lastActiveAt

chats/{chatId}
  ├─ userId, title, createdAt, updatedAt
  └─ messages: [ { role, content, structured?, createdAt } ]

savedSchemes/{id}
  ├─ userId, scheme{...}, profileSnapshot{...}, savedAt

savedChecklists/{id}
  ├─ userId, service, checklist{...}, savedAt

complaints/{id}
  ├─ userId, category, department, priority, title,
  │  description, imageRef?, status, createdAt

# Simplifier output is transient by default (not persisted) unless
# the user chooses to save it — can reuse a `savedNotes/{id}` collection.
```

Indexes: composite `(userId, createdAt desc)` on `chats`, `complaints`,
`savedSchemes`, `savedChecklists` for fast dashboard listing.

---

## 6. JSON Schemas

### 6.1 Standard Envelopes
```jsonc
// Success
{ "status": "success", "message": "ok", "data": { /* payload */ } }

// Error
{ "status": "error", "message": "Human readable", "code": "INVALID_INPUT",
  "details": { /* optional */ } }
```

### 6.2 Feature 1 — Assistant
```jsonc
// Request
{ "message": "How do I apply for a passport?", "chatId": "optional" }

// AI data payload
{
  "answer": "string (plain-language explanation)",
  "steps": ["string", "..."],
  "requiredDocuments": ["string", "..."],
  "processingTime": "string | null",
  "officialPortals": [{ "name": "string", "url": "string" }],
  "confidence": 0.0,                 // 0..1
  "uncertaintyNote": "string | null" // shown when info can't be confirmed
}
```

### 6.3 Feature 2 — Schemes
```jsonc
// Request
{ "age": 22, "state": "Maharashtra", "occupation": "Student",
  "education": "Undergraduate", "annualIncome": 150000, "gender": "Female" }

// AI data payload
{
  "schemes": [
    {
      "name": "string",
      "whyEligible": "string",
      "benefits": ["string"],
      "requiredDocuments": ["string"],
      "applicationProcess": ["string"],
      "officialWebsite": "string | null",
      "confidence": 0.0
    }
  ],
  "disclaimer": "Eligibility is indicative; verify on official portals."
}
```

### 6.4 Feature 3 — Checklist
```jsonc
// Request
{ "service": "Passport" }

// AI data payload
{
  "service": "Passport",
  "requiredDocuments": ["string"],
  "optionalDocuments": ["string"],
  "processingTime": "string | null",
  "commonRejectionReasons": ["string"],
  "tips": ["string"],
  "officialWebsite": "string | null",
  "confidence": 0.0
}
```

### 6.5 Feature 4 — Simplify
```jsonc
// Request
{ "text": "long government notification..." }

// AI data payload
{
  "summary": "string",
  "keyPoints": ["string"],
  "importantDates": [{ "label": "string", "date": "string" }],
  "citizenActions": ["string"],
  "confidence": 0.0
}
```

### 6.6 Feature 5 — Complaint
```jsonc
// Request
{ "description": "Overflowing garbage near ...",
  "imageBase64": "optional", "location": "optional" }

// AI data payload
{
  "category": "Garbage | Pothole | Streetlight | Water | Other",
  "department": "string",
  "priority": "Low | Medium | High",
  "title": "string",
  "description": "string",
  "confidence": 0.0
}
```

### 6.7 Feature 6 — Dashboard
```jsonc
{
  "counts": { "chats": 0, "savedSchemes": 0, "savedChecklists": 0, "complaints": 0 },
  "recentChats": [{ "chatId": "...", "title": "...", "updatedAt": "..." }],
  "recentComplaints": [{ "id": "...", "title": "...", "status": "...", "createdAt": "..." }]
}
```

---

## 7. AI Workflow

### 7.1 General Pipeline (every AI feature)
```
Request → @require_auth (verify Firebase token)
        → validate & sanitize input (utils/validators)
        → build prompt (services/prompts.py: system + user template)
        → Groq chat completion in JSON mode (response_format=json_object)
        → parse + schema-validate output (models/schemas.py)
        → on validation failure: one repair retry, else safe fallback
        → persist if applicable (Firestore)
        → wrap in success envelope → JSON response
```

### 7.2 Design Principles
- **JSON mode**: instruct Groq to return only the target schema; validate server-side.
- **Confidence + uncertainty**: every schema carries a `confidence` (0–1); the
  assistant surfaces an `uncertaintyNote` rather than hallucinating specifics.
- **Official portals**: prompts require citing official `.gov.in` portals when known.
- **Grounding guardrail**: system prompt forbids inventing scheme names, exact
  fees, or deadlines it cannot support; prefer "verify on the official portal".
- **Determinism**: low temperature (~0.2–0.4) for structured features; slightly
  higher for the conversational assistant.
- **Repair loop**: if JSON fails validation, re-prompt once with the validation
  error; on second failure return a graceful degraded response.
- **Model**: Groq Llama-3.3-70B (configurable via `GROQ_MODEL`).

### 7.3 Prompt Strategy
- One system prompt per feature (role + rules + output contract).
- User content injected via a builder; never trust raw user text as instructions
  (prompt-injection mitigation — treat pasted notifications as *data*, not commands).

---

## 8. Security Considerations

### 8.1 Authentication & Authorization
- Firebase **ID token** verified on every protected route via Admin SDK.
- `@require_auth` extracts `uid`; all queries are scoped to that `uid`.
- Ownership checks on every read/delete (`doc.userId == request.uid`).
- Firestore Security Rules enforce `request.auth.uid == resource.data.userId`
  as defense-in-depth (never rely on client alone).

### 8.2 Input & AI Safety
- Server-side validation of every request body (types, ranges, max lengths).
- Text-size limits on Simplifier/Complaint inputs to bound cost & abuse.
- Prompt-injection mitigation: user-pasted content is quoted as data; system
  instructions are fixed and never overridable by user text.
- Output validation: AI JSON is schema-checked before it reaches the client.

### 8.3 Secrets & Config
- All secrets (Groq key, Firebase credentials) via environment variables only.
- No secrets in the repo; `.env` gitignored; Render dashboard for prod secrets.
- Firebase service account provided inline (`FIREBASE_CREDENTIALS_JSON`) or path.

### 8.4 Transport & Platform
- HTTPS enforced by Render.
- CORS restricted to the known frontend origin(s) in production (`CORS_ORIGINS`).
- Stateless backend → no server session storage to leak.

### 8.5 Abuse & Cost Control
- Optional per-user rate limiting (`utils/rate_limit.py`) to cap Groq spend.
- Payload size caps; reject oversized images/text early.
- Structured logging without logging PII or full document contents.

### 8.6 Privacy
- Store only what the user saves; Simplifier output transient by default.
- Users can delete any saved item (chats, schemes, checklists, complaints).
- Clear disclaimer: guidance is indicative; verify on official portals.

---

## 9. Suggested Build Order (Hackathon)
1. Auth middleware + `/api/auth/me` (unblocks everything).
2. `groq_service` JSON-mode + `schemas.py` validation (shared spine).
3. Feature 1 (Assistant) end-to-end → proves the pipeline.
4. Features 2–5 (reuse the pipeline, swap prompts + schema).
5. Persistence + Dashboard aggregation.
6. Frontend wiring (Stitch) + polish + demo script.
```
```
