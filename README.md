# ESN Consultancy AI Automation Command Center

Production-ready scaffold for ESN Consultancy's AI business automation platform: Node.js API, Python multi-agent orchestration, webhook pipelines, Lead CRM, AI content generator, client onboarding, invoice automation, real-time dashboard, OpenAI/Meta/Discord readiness, Docker + Hostinger deployment, and JWT authentication.

## What is included

- **Node.js backend** (`backend/src`) using the built-in HTTP runtime with JWT auth, CRM, dashboard, content, onboarding, invoice, integration, and webhook routes.
- **Python backend** (`python-agents/app`) with FastAPI multi-agent orchestration for strategy, CRM, content, operations, and finance recommendations.
- **Webhook pipelines** for Make.com, n8n, and Zapier with environment-driven delivery and safe simulation when URLs are not configured.
- **Real-time command dashboard** (`index.html`) that authenticates, polls metrics, displays lead pipeline state, and launches lead/content workflows.
- **Deployment assets** with `Dockerfile`, `compose.yml`, Hostinger Nginx reverse proxy sample, and a VPS deploy script.

## Quick start

```bash
cp .env.example .env
npm install
npm start
```

Open <http://localhost:8080> and use the demo operator credentials:

- Email: `admin@esnconsultancy.com`
- Password: `esn-admin-2026`

> Replace the demo user and `JWT_SECRET` before handling real client data.

## Python agent service

```bash
cd python-agents
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8090
```

The Node API will call `PYTHON_AGENT_URL` and fall back to deterministic local orchestration if the Python service is offline.

## Docker deployment

```bash
cp .env.example .env
# edit .env with production secrets
docker compose -f compose.yml up -d --build
```

For Hostinger VPS, point Nginx at the Node container using `deploy/hostinger/nginx.conf`, then run `scripts/hostinger-deploy.sh` from the application directory.

## Key API endpoints

| Area | Endpoint | Notes |
| --- | --- | --- |
| Health | `GET /api/health` | Public service check |
| Auth | `POST /api/auth/login` | Returns JWT |
| Dashboard | `GET /api/dashboard` | Metrics, leads, invoices, integrations |
| Lead CRM | `GET/POST /api/leads` | Create leads and trigger Make.com/n8n |
| Lead CRM | `PATCH /api/leads/:id/stage` | Move a lead through the pipeline |
| Content | `POST /api/content/generate` | AI content scaffold + agent plan |
| Onboarding | `POST /api/onboarding/start` | Client intake and onboarding checklist |
| Invoices | `GET /api/invoices` | List invoices |
| Invoices | `POST /api/invoices/generate` | Draft invoice + Zapier trigger |
| Integrations | `GET /api/integrations/status` | OpenAI, Meta, Discord, webhook readiness |
| Agent mesh | `POST /api/integrations/agents/orchestrate` | Proxy to Python multi-agent service |

## Environment variables

Copy `.env.example` and configure:

- `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`
- `PYTHON_AGENT_URL`
- `OPENAI_API_KEY`
- `META_ACCESS_TOKEN`, `META_PIXEL_ID`
- `DISCORD_BOT_TOKEN`, `DISCORD_WEBHOOK_URL`
- `MAKE_WEBHOOK_URL`, `N8N_WEBHOOK_URL`, `ZAPIER_WEBHOOK_URL`
- `INVOICE_TAX_RATE`

## Next production steps

1. Replace in-memory storage with Postgres and Redis-backed queues.
2. Add role-based authorization policies for sales, delivery, finance, and admin teams.
3. Wire provider-specific SDK calls for OpenAI, Meta conversion events, Discord alerts, and payment collection.
4. Add structured observability, CI/CD, backups, and uptime monitoring.
