# ESN Consultancy AI Business Automation Architecture

## Runtime services

- **Node.js API + static dashboard**: JWT authentication, CRM, content, onboarding, invoice, webhook, integration, and dashboard endpoints.
- **Python agent mesh**: FastAPI service that coordinates strategy, CRM, content, operations, and finance agents.
- **Webhook pipelines**: Make.com, n8n, and Zapier dispatches are environment-driven and safely simulated when URLs are missing.
- **Integrations**: OpenAI, Meta, and Discord secrets are loaded from environment variables and reported through `/api/integrations/status`.

## Primary workflow

1. A user logs into the command center with JWT auth.
2. Leads are created or advanced in the CRM.
3. The API triggers Make.com and n8n lead lifecycle webhooks.
4. The Python agent mesh generates cross-functional recommendations.
5. Content, onboarding, and invoice automations create deliverables and trigger Zapier reminders.
6. The real-time dashboard polls operational metrics and activities.

## Production hardening checklist

- Replace demo credentials and set a high-entropy `JWT_SECRET`.
- Configure managed Postgres/Redis before storing real client data.
- Add provider-specific OpenAI, Meta, Discord, Make.com, n8n, and Zapier API keys in `.env`.
- Put Nginx/Cloudflare TLS in front of the Node container for Hostinger VPS deployment.
- Enable centralized logging, backups, uptime checks, and alerting.
