# Production Deployment Runbook

This repository is prepared for:
- Backend: Render
- Frontend: Netlify

## 1) Required environment variables (local machine running deploy script)

Set these before running deployment:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`
- `PUBLIC_BACKEND_URL` (example: `https://talkmetrix-backend.onrender.com`)
- `PUBLIC_FRONTEND_URL` (example: `https://talkmetrix-insights.netlify.app`)

## 2) Backend environment (Render)

Defined in `talkmetrix-backend/render.yaml`:
- `ENVIRONMENT=production`
- `DB_PATH=/var/data/talkmetrix.db`
- `CORS_ORIGIN_REGEX=^https://.*\.netlify\.app$`
- `RATE_LIMIT_REQUESTS=120`
- `RATE_LIMIT_WINDOW_SECONDS=60`
- `MAX_UPLOAD_MB=20`
- `TRUSTED_HOSTS=talkmetrix-backend.onrender.com,*.onrender.com`
- `API_AUTH_KEY` generated automatically

Also set manually in Render:
- `CORS_ORIGINS` to your real Netlify URL(s)
- `GROQ_API_KEY` (optional but recommended for LLM scoring quality)

## 3) Frontend environment (Netlify)

Set in Netlify site env vars:
- `VITE_API_BASE_URL` = your Render backend URL

## 4) Deploy command

From repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-public.ps1
```

## 5) Smoke tests only

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1 -FrontendUrl <PUBLIC_FRONTEND_URL> -BackendUrl <PUBLIC_BACKEND_URL>
```
