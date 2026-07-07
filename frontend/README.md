# CivicSathi AI — Frontend

React + Vite single-page app for **CivicSathi AI**. Signs users in with Firebase
Google auth, sends the ID token as `Authorization: Bearer <token>` to the Flask
backend, and drives the five AI features plus a dashboard. Visuals come from
Google Stitch designs; the integration layer (auth, API client, hooks) is hand-written.

## Stack
- React 18 + Vite 5
- React Router 6
- Firebase Web SDK (Google auth)
- Tailwind CSS via **CDN** (Stitch design tokens live in `index.html`)

> Tailwind is loaded from the CDN in `index.html` together with the Stitch
> design system (color tokens, fonts, and helper classes like `.glass-card`,
> `.ai-glow`, `.shimmer`). There is **no** local Tailwind/PostCSS build step.

## Project structure
```
frontend/
├── index.html                 # Tailwind CDN + Stitch tokens + global helper styles
├── vite.config.js · vercel.json · .env.example
└── src/
    ├── main.jsx · App.jsx      # entry + router (public vs. protected routes)
    ├── firebase.js             # Firebase init (VITE_FIREBASE_* env)
    ├── context/AuthContext.jsx # user state, login/logout, getToken()
    ├── lib/
    │   ├── apiClient.js        # fetch wrapper: injects token, unwraps {data}, throws on error
    │   └── endpoints.js        # one function per backend route
    ├── hooks/useApi.js         # generic { data, loading, error, run }
    ├── components/             # Layout, Sidebar, ProtectedRoute, Loader, ErrorBanner, ConfidenceBadge
    └── pages/                  # Landing, Login, Dashboard, Assistant, SchemeFinder,
                                #   Checklist, Simplifier, Complaint, Profile
```

## Routes
| Path | Access | Page |
|---|---|---|
| `/landing` | Public | Marketing landing page |
| `/login` | Public | Google sign-in |
| `/` | Protected | Dashboard |
| `/assistant` | Protected | AI Civic Assistant |
| `/schemes` | Protected | Scheme Eligibility Finder |
| `/checklist` | Protected | Document Checklist Generator |
| `/simplify` | Protected | Notification Simplifier |
| `/complaint` | Protected | Complaint Generator |
| `/profile` | Protected | User profile |

Protected routes share `<Layout/>` (fixed sidebar) and are gated by
`<ProtectedRoute/>`, which redirects to `/login` when signed out.

## Setup
```bash
cd frontend
npm install
cp .env.example .env.local     # fill in the values below
npm run dev                    # http://localhost:5173
```

### Environment (`.env.local`)
All `VITE_*` vars are exposed to the browser.
```
VITE_API_BASE_URL=http://localhost:5000   # backend base URL, no trailing slash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
Firebase values come from the Firebase console → Project settings → General →
Your apps → Web app config.

## Connecting to the backend
1. Run the backend (see `../backend/README.md`) with a real `GROQ_API_KEY` and
   Firebase Admin credentials so responses are non-stub.
2. Set the backend's `CORS_ORIGINS` to this app's origin:
   - Dev: `http://localhost:5173`
   - Prod: your Vercel URL (e.g. `https://civicsathi.vercel.app`)
3. Auth is header-based (no cookies): `apiClient` attaches the current user's
   Firebase ID token on every request; the backend verifies it.

## How the wiring works
Each page is thin glue over the shared layer:
```jsx
const { data, loading, error, run } = useApi(SchemesAPI.find);
// on submit: run({ age, state, occupation, education, annualIncome, gender });
// render: data.schemes[], data.disclaimer, <ConfidenceBadge value={s.confidence} />
```
- `endpoints.js` maps 1:1 to the backend REST contract (`docs/SPEC.md`).
- `apiClient.js` unwraps the `{ status, message, data }` envelope and throws an
  `ApiError` (with `.code`/`.status`) on failure, which pages show via `ErrorBanner`.

## Updating a screen from a new Stitch export
1. In Google Stitch, edit the screen and export HTML/Tailwind.
2. Replace the JSX in the matching `src/pages/*.jsx`, keeping the wiring
   (imports, `useApi`, `run(...)`, and the `data.*` bindings).
3. Remove the Stitch `<nav>` sidebar (the shared `Sidebar` handles navigation)
   and any `<!DOCTYPE>/<html>/<head>/<body>` wrappers and `<script>` tags.
4. Design tokens/helper classes are global (in `index.html`), so classNames just work.

## Build & deploy (Vercel)
```bash
npm run build      # outputs dist/
npm run preview    # preview the production build locally
```
- `vercel.json` rewrites all paths to `index.html` for SPA routing.
- In Vercel: set the project root to `frontend/`, add the `VITE_*` env vars,
  and deploy. After deploy, update the backend `CORS_ORIGINS` to the Vercel URL.
