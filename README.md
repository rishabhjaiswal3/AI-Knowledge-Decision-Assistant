# Noema — AI Knowledge & Decision Assistant

Multi-tenant SaaS: each organization uploads PDFs and gets its own embeddable assistant that answers from those documents, using an LLM for language and separate decision models for structured decisions.

> Status: organization sign-up, login and logout are done. Knowledge base, assistant and the AI pipeline come next.

## Stack

| Layer | Choice |
|---|---|
| Backend | Python 3.12, FastAPI, PyMongo (async) |
| Database | MongoDB (Atlas Local in Docker for development, MongoDB Atlas in production): documents, vector search and keyword search in one place |
| Auth | Email/password (bcrypt) → JWT in an HttpOnly cookie |
| Frontend | React 19 + TypeScript, Vite, React Router |

## Run locally

Prerequisites: Docker, [uv](https://docs.astral.sh/uv/), Node 20+.

```bash
# 1. Secrets (never committed): copy the examples and fill them in
cp .env.example .env                    # MongoDB user/password
cp backend/.env.example backend/.env    # MONGODB_URI (same credentials) + JWT_SECRET
openssl rand -hex 24                    # use for MONGO_PASSWORD
openssl rand -hex 32                    # use for JWT_SECRET

# 2. Database (MongoDB on 127.0.0.1:27018; first start takes ~30s)
docker compose up -d

# 3. Backend (http://localhost:8010, docs at /docs)
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8010

# 4. Frontend (http://localhost:5173)
cd ../frontend
npm install
npm run dev
```

The backend refuses to start if `MONGODB_URI` or `JWT_SECRET` is missing, or if `JWT_SECRET` is shorter than 32 characters.

Indexes are created automatically when the backend starts.

### Secrets

No credentials are stored in the repository. Locally they live in the git-ignored `.env` files; in production they come from the host's secret store (e.g. AWS Secrets Manager or the platform's environment variables), and `COOKIE_SECURE=true` is set.

## Data model

Every tenant-owned document has `organization_id`, and every query filters on it.

| Collection | Purpose |
|---|---|
| `organizations` | A tenant |
| `users` | Dashboard accounts, each belonging to one organization |

`users.email` is stored lowercase with a unique index. More collections are added as features land.

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create organization + owner account, sets session cookie |
| POST | `/api/auth/login` | – | Sets session cookie |
| POST | `/api/auth/logout` | – | Clears session cookie |
| GET | `/api/auth/me` | cookie | Current user and organization |
| GET | `/api/health` | – | Health check |

## Authentication

- Passwords are hashed with bcrypt (8+ characters, a letter and a number).
- On login/sign-up the backend sets a signed JWT in an **HttpOnly** cookie (`noema_session`). JavaScript can't read it, so an XSS bug can't steal the session; the token is never in a response body or `localStorage`.
- `SameSite=Lax` stops the cookie from being sent on cross-site form posts (CSRF). Set `COOKIE_SECURE=true` in production so it's only sent over HTTPS.
- In development the Vite dev server proxies `/api` to the backend, so the frontend and API share one origin.
- Wrong email and wrong password return the same message and take the same time, so attackers can't probe which emails exist.
- Session JWTs carry a dedicated audience (`kda-admin`), so the public assistant tokens added later can never open the dashboard.
