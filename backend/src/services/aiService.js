import { env } from '../config/env.js';

const playbooks = {
  strategy: 'Diagnose bottlenecks, quantify revenue impact, and sequence automations by ROI.',
  content: 'Create conversion-focused assets with brand-safe positioning and clear calls to action.',
  operations: 'Turn client intake into repeatable checklists, owners, SLAs, and webhook triggers.',
  finance: 'Automate invoice generation, tax calculation, reminders, and payment reconciliation.'
};

export async function orchestrateAgents(goal, context = {}) {
  try {
    const response = await fetch(`${env.pythonAgentUrl}/orchestrate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ goal, context })
    });
    if (response.ok) return response.json();
  } catch {
    // Local deterministic fallback keeps the Node API production-usable when the Python service is offline.
  }

  return {
    goal,
    mode: 'node-fallback',
    agents: Object.entries(playbooks).map(([agent, playbook]) => ({ agent, playbook, recommendation: `${agent} agent queued for: ${goal}` })),
    nextActions: [
      'Score and segment the account',
      'Generate a client-facing automation roadmap',
      'Trigger CRM, onboarding, and invoice workflows'
    ],
    context
  };
}

export function generateContent({ channel, audience, offer, tone = 'executive' }) {
  return {
    channel,
    headline: `Automate ${audience} growth with ESN Consultancy`,
    hook: `Your ${audience} team can stop losing hours to manual follow-up, reporting, and admin work.`,
    body: `ESN Consultancy deploys AI agents, webhook pipelines, and dashboard visibility around your ${offer}. The result is faster response times, cleaner operations, and measurable ROI without adding headcount.`,
    cta: channel === 'discord' ? 'Reply with “AUTOMATE” for a private workflow audit.' : 'Book an AI automation audit with ESN Consultancy.',
    tone
  };
}
