import crypto from 'node:crypto';

const now = () => new Date().toISOString();

export const store = {
  users: [
    {
      id: 'usr_admin',
      name: 'ESN Admin',
      email: 'admin@esnconsultancy.com',
      // demo password: esn-admin-2026. Replace with a managed identity provider before production.
      password: 'esn-admin-2026',
      role: 'admin'
    }
  ],
  leads: [
    { id: 'lead_001', company: 'Apex Dental Group', contact: 'Maya Patel', email: 'maya@apex.example', source: 'Meta Ads', score: 92, value: 18500, stage: 'proposal', owner: 'ESN Growth', createdAt: now() },
    { id: 'lead_002', company: 'Northstar Logistics', contact: 'Daniel Wright', email: 'daniel@northstar.example', source: 'LinkedIn Outreach', score: 84, value: 24000, stage: 'qualified', owner: 'ESN Automation', createdAt: now() }
  ],
  projects: [
    { id: 'proj_001', name: 'AI Receptionist Rollout', client: 'Apex Dental Group', status: 'active', automationLift: 38 },
    { id: 'proj_002', name: 'Invoice Ops Copilot', client: 'Northstar Logistics', status: 'active', automationLift: 44 }
  ],
  invoices: [
    { id: 'inv_001', client: 'Apex Dental Group', amount: 9500, tax: 760, total: 10260, status: 'sent', dueDate: '2026-06-01' }
  ],
  automations: [
    { id: 'auto_make', name: 'Make.com lead enrichment', status: 'ready', eventsToday: 128 },
    { id: 'auto_n8n', name: 'n8n onboarding pipeline', status: 'ready', eventsToday: 43 },
    { id: 'auto_zapier', name: 'Zapier invoice reminders', status: 'ready', eventsToday: 19 }
  ],
  activities: []
};

export function addActivity(type, message, metadata = {}) {
  const activity = { id: createId('act'), type, message, metadata, createdAt: now() };
  store.activities.unshift(activity);
  store.activities = store.activities.slice(0, 100);
  return activity;
}

export function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}

addActivity('system', 'ESN AI automation command center booted');
addActivity('crm', 'Lead scoring model prioritized Apex Dental Group');
addActivity('agent', 'Strategy, copy, finance, and ops agents synchronized');
