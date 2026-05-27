import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { store, addActivity, createId } from './data/store.js';
import { signUser, verifyToken } from './middleware/auth.js';
import { env } from './config/env.js';
import { generateContent, orchestrateAgents } from './services/aiService.js';
import { dispatchWebhook } from './services/webhookService.js';
import { getIntegrationStatus } from './services/integrationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization', 'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS' });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function requireAuth(req, res) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const user = token ? verifyToken(token) : null;
  if (!user) {
    json(res, 401, { error: 'Missing or invalid bearer token' });
    return null;
  }
  return user;
}

function dashboardPayload() {
  const pipelineValue = store.leads.reduce((sum, lead) => sum + lead.value, 0);
  const invoiceRevenue = store.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  return {
    metrics: {
      activeProjects: store.projects.filter((project) => project.status === 'active').length,
      pipelineValue,
      automationEventsToday: store.automations.reduce((sum, automation) => sum + automation.eventsToday, 0),
      invoiceRevenue,
      averageLeadScore: Math.round(store.leads.reduce((sum, lead) => sum + lead.score, 0) / store.leads.length)
    },
    leads: store.leads,
    projects: store.projects,
    invoices: store.invoices,
    automations: store.automations,
    activities: store.activities,
    integrations: getIntegrationStatus()
  };
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const safePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.normalize(path.join(rootDir, safePath));
  if (!filePath.startsWith(rootDir)) return json(res, 403, { error: 'Forbidden' });
  try {
    const file = await fs.readFile(filePath);
    const type = filePath.endsWith('.html') ? 'text/html' : 'application/octet-stream';
    res.writeHead(200, { 'content-type': type });
    res.end(file);
  } catch {
    const file = await fs.readFile(path.join(rootDir, 'index.html'));
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(file);
  }
}

export async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url, 'http://localhost');
  const route = `${req.method} ${url.pathname}`;

  try {
    if (route === 'GET /api/health') return json(res, 200, { status: 'ok', service: 'esn-node-api', time: new Date().toISOString() });

    if (route === 'POST /api/auth/login') {
      const body = await readBody(req);
      const user = store.users.find((candidate) => candidate.email === body.email && candidate.password === body.password);
      if (!user) return json(res, 401, { error: 'Invalid credentials' });
      return json(res, 200, { token: signUser(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }

    if (url.pathname.startsWith('/api/') && !requireAuth(req, res)) return;

    if (route === 'GET /api/dashboard') return json(res, 200, dashboardPayload());
    if (route === 'GET /api/leads') return json(res, 200, { leads: store.leads });

    if (route === 'POST /api/leads') {
      const body = await readBody(req);
      const lead = { id: createId('lead'), source: 'Manual', score: 70, stage: 'new', owner: 'ESN Growth', ...body, value: Number(body.value ?? 0), createdAt: new Date().toISOString() };
      store.leads.unshift(lead);
      addActivity('crm', `New lead captured: ${lead.company}`, { leadId: lead.id });
      await Promise.allSettled([dispatchWebhook('make', 'lead.created', lead), dispatchWebhook('n8n', 'lead.created', lead)]);
      return json(res, 201, { lead });
    }

    if (req.method === 'PATCH' && url.pathname.match(/^\/api\/leads\/[^/]+\/stage$/)) {
      const body = await readBody(req);
      const lead = store.leads.find((candidate) => candidate.id === url.pathname.split('/')[3]);
      if (!lead) return json(res, 404, { error: 'Lead not found' });
      lead.stage = body.stage;
      addActivity('crm', `${lead.company} moved to ${lead.stage}`, { leadId: lead.id });
      return json(res, 200, { lead });
    }

    if (route === 'POST /api/content/generate') {
      const body = await readBody(req);
      const content = generateContent(body);
      const agentPlan = await orchestrateAgents(`Create ${body.channel} content for ${body.audience}`, body);
      addActivity('content', `Generated ${body.channel} content for ${body.audience}`);
      return json(res, 200, { content, agentPlan });
    }

    if (route === 'POST /api/onboarding/start') {
      const body = await readBody(req);
      const onboarding = { id: createId('onboard'), status: 'started', checklist: ['Access audit', 'Workflow map', 'Integration credentials', 'ROI baseline', 'Launch calendar'], ...body, createdAt: new Date().toISOString() };
      const agentPlan = await orchestrateAgents(`Onboard ${body.client}`, body);
      await dispatchWebhook('n8n', 'onboarding.started', onboarding);
      addActivity('onboarding', `Client onboarding started for ${body.client}`, { onboardingId: onboarding.id });
      return json(res, 201, { onboarding, agentPlan });
    }

    if (route === 'GET /api/invoices') return json(res, 200, { invoices: store.invoices });
    if (route === 'POST /api/invoices/generate') {
      const body = await readBody(req);
      const amount = body.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = Number((amount * env.invoiceTaxRate).toFixed(2));
      const invoice = { id: createId('inv'), client: body.client, amount, tax, total: amount + tax, status: 'draft', dueDate: body.dueDate, lineItems: body.lineItems };
      store.invoices.unshift(invoice);
      await dispatchWebhook('zapier', 'invoice.generated', invoice);
      addActivity('finance', `Invoice generated for ${body.client}`, { invoiceId: invoice.id, total: invoice.total });
      return json(res, 201, { invoice });
    }

    if (route === 'GET /api/integrations/status') return json(res, 200, getIntegrationStatus());
    if (route === 'POST /api/integrations/agents/orchestrate') {
      const body = await readBody(req);
      return json(res, 200, await orchestrateAgents(body.goal ?? 'Optimize ESN business automation', body.context ?? {}));
    }
    if (req.method === 'POST' && url.pathname.startsWith('/api/integrations/webhooks/')) {
      const [, , , , provider, event] = url.pathname.split('/');
      return json(res, 200, await dispatchWebhook(provider, event, await readBody(req)));
    }

    if (url.pathname.startsWith('/api/')) return json(res, 404, { error: 'Route not found', path: url.pathname });
    return serveStatic(req, res);
  } catch (error) {
    return json(res, 500, { error: error.message || 'Internal server error' });
  }
}

export function createApp() {
  return handleRequest;
}
